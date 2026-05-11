(function () {
    'use strict';

    var LANGS = ['en', 'az', 'ru'];
    var posts = [];
    var activePost = null;
    var activeLang = 'en';

    var loginPanel = document.getElementById('login-panel');
    var cmsPanel = document.getElementById('cms-panel');
    var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');
    var postList = document.getElementById('post-list');
    var postForm = document.getElementById('post-form');
    var panels = document.getElementById('translation-panels');
    var message = document.getElementById('editor-message');
    var statusPill = document.getElementById('status-pill');
    var leadList = document.getElementById('lead-list');
    var analyticsCards = document.getElementById('analytics-cards');
    var indexnowMessage = document.getElementById('indexnow-message');

    function api(path, options) {
        options = options || {};
        options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        options.credentials = 'include';
        return fetch('/api/admin' + path, options).then(function (res) {
            return res.json().then(function (body) {
                if (!res.ok) {
                    var error = new Error(body.error || 'Request failed');
                    error.status = res.status;
                    error.code = body.code || '';
                    error.relogin = Boolean(body.relogin || res.status === 401);
                    throw error;
                }
                return body;
            });
        });
    }

    function showLogin(messageText) {
        loginPanel.hidden = false;
        cmsPanel.hidden = true;
        if (messageText) loginError.textContent = messageText;
        var input = document.getElementById('admin-password');
        if (input) setTimeout(function () { input.focus(); }, 50);
    }

    function handleApiError(err, target) {
        if (err.relogin || err.code === 'DB_AUTH_FAILED') {
            showLogin(err.message || 'Please sign in again.');
            return;
        }
        if (target) target.textContent = err.message;
    }

    function slugify(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
            .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            .substring(0, 120);
    }

    function esc(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function formatNumber(value) {
        if (value === null || value === undefined || value === '') return '0';
        return Number(value).toLocaleString();
    }

    function formatJson(value) {
        if (!value || typeof value !== 'object') return 'No data';
        return Object.keys(value).map(function (key) {
            var item = value[key];
            if (item && typeof item === 'object') item = JSON.stringify(item);
            return esc(key.replace(/_/g, ' ')) + ': ' + esc(item);
        }).join('\n');
    }

    function buildPanels() {
        panels.innerHTML = LANGS.map(function (lang) {
            return '<section class="translation-panel' + (lang === activeLang ? ' active' : '') + '" data-panel="' + lang + '">' +
                '<div class="two-col">' +
                    '<div class="field"><label>Title (' + lang.toUpperCase() + ')</label><input data-field="title" data-lang="' + lang + '"></div>' +
                    '<div class="field"><label>Slug</label><input data-field="slug" data-lang="' + lang + '"></div>' +
                '</div>' +
                '<div class="field"><label>Excerpt</label><textarea data-field="excerpt" data-lang="' + lang + '" rows="3"></textarea></div>' +
                '<div class="field">' +
                    '<label>Markdown content</label>' +
                    '<div class="toolbar" data-toolbar="' + lang + '">' +
                        '<button type="button" data-md="bold">B</button>' +
                        '<button type="button" data-md="italic">I</button>' +
                        '<button type="button" data-md="h1">H1</button>' +
                        '<button type="button" data-md="h2">H2</button>' +
                        '<button type="button" data-md="h3">H3</button>' +
                        '<button type="button" data-md="link">Link</button>' +
                        '<button type="button" data-md="image">Image</button>' +
                        '<button type="button" data-md="list">List</button>' +
                        '<button type="button" data-md="table">Table</button>' +
                        '<button type="button" data-md="quote">Quote</button>' +
                    '</div>' +
                    '<textarea data-field="markdown" data-lang="' + lang + '"></textarea>' +
                '</div>' +
                '<div class="two-col">' +
                    '<div class="field"><label>SEO title</label><input data-field="seo_title" data-lang="' + lang + '"></div>' +
                    '<div class="field"><label>SEO keywords</label><input data-field="seo_keywords" data-lang="' + lang + '"></div>' +
                '</div>' +
                '<div class="two-col">' +
                    '<div class="field"><label>Target location for SEO</label><input data-field="target_location" data-lang="' + lang + '" placeholder="Bakı, Sumqayıt, Gəncə..."></div>' +
                    '<div class="field"><label>Location SEO title</label><input data-field="local_seo_title" data-lang="' + lang + '" placeholder="Günəş paneli quraşdırılması Bakıda"></div>' +
                '</div>' +
                '<div class="field"><label>Location SEO description</label><textarea data-field="local_seo_description" data-lang="' + lang + '" rows="2"></textarea></div>' +
                '<div class="field"><label>SEO description</label><textarea data-field="seo_description" data-lang="' + lang + '" rows="3"></textarea></div>' +
                '<div class="field"><label>Image alt text</label><input data-field="image_alt" data-lang="' + lang + '"></div>' +
            '</section>';
        }).join('');
    }

    function emptyPost() {
        return { id: '', status: 'draft', hero_image: '', translations: {} };
    }

    function translation(post, lang) {
        return (post.translations && post.translations[lang]) || {};
    }

    function fillForm(post) {
        activePost = post || emptyPost();
        document.getElementById('post-id').value = activePost.id || '';
        document.getElementById('hero-image').value = activePost.hero_image || '';
        statusPill.textContent = activePost.status === 'published' ? 'Published' : 'Draft';
        LANGS.forEach(function (lang) {
            var t = translation(activePost, lang);
            ['title', 'slug', 'excerpt', 'markdown', 'seo_title', 'seo_description', 'seo_keywords', 'target_location', 'local_seo_title', 'local_seo_description', 'image_alt'].forEach(function (field) {
                var input = postForm.querySelector('[data-lang="' + lang + '"][data-field="' + field + '"]');
                if (input) input.value = t[field] || '';
            });
        });
        renderList();
    }

    function readForm(status) {
        var payload = {
            status: status,
            hero_image: document.getElementById('hero-image').value.trim(),
            translations: {}
        };
        LANGS.forEach(function (lang) {
            payload.translations[lang] = {};
            ['title', 'slug', 'excerpt', 'markdown', 'seo_title', 'seo_description', 'seo_keywords', 'target_location', 'local_seo_title', 'local_seo_description', 'image_alt'].forEach(function (field) {
                var input = postForm.querySelector('[data-lang="' + lang + '"][data-field="' + field + '"]');
                payload.translations[lang][field] = input ? input.value.trim() : '';
            });
        });
        return payload;
    }

    function renderList() {
        if (!posts.length) {
            postList.innerHTML = '<p>No posts yet.</p>';
            return;
        }
        postList.innerHTML = posts.map(function (post) {
            var title = translation(post, 'en').title || translation(post, 'az').title || translation(post, 'ru').title || 'Untitled';
            return '<button type="button" class="post-item' + (activePost && activePost.id === post.id ? ' active' : '') + '" data-id="' + post.id + '">' +
                '<strong>' + esc(title) + '</strong>' +
                '<span>' + esc(post.status) + ' · updated ' + esc(new Date(post.updated_at).toLocaleString()) + '</span>' +
            '</button>';
        }).join('');
    }

    function loadPosts() {
        return api('/posts').then(function (data) {
            posts = data.posts || [];
            renderList();
            if (!activePost) fillForm(posts[0] || emptyPost());
        });
    }

    function showCms() {
        loginPanel.hidden = true;
        cmsPanel.hidden = false;
        loadPosts().catch(function (err) { handleApiError(err, message); });
        loadDashboard();
    }

    function renderAnalytics(data) {
        var analytics = data || {};
        var leads = analytics.leads || {};
        var posts = analytics.posts || {};
        analyticsCards.innerHTML = [
            ['Total leads', formatNumber(leads.total_leads)],
            ['Leads last 7 days', formatNumber(leads.leads_7d)],
            ['Leads last 30 days', formatNumber(leads.leads_30d)],
            ['Avg. system size', formatNumber(leads.avg_system_size_kwp) + ' kWp'],
            ['Estimated pipeline', formatNumber(leads.total_estimated_cost_azn) + ' AZN'],
            ['Published posts', formatNumber(posts.published_posts)]
        ].map(function (card) {
            return '<article class="analytics-card"><span>' + esc(card[0]) + '</span><strong>' + esc(card[1]) + '</strong></article>';
        }).join('');
    }

    function renderLeads(leads) {
        if (!leads || !leads.length) {
            leadList.innerHTML = '<tr><td colspan="6">No calculator leads yet.</td></tr>';
            return;
        }
        leadList.innerHTML = leads.map(function (lead) {
            var created = lead.created_at ? new Date(lead.created_at).toLocaleString() : '';
            var inputData = lead.input_data || lead.calculation_data || {
                house_size_m2: lead.house_size_m2,
                people_count: lead.people_count,
                daytime_occupancy: lead.daytime_occupancy,
                electric_cooking: lead.electric_cooking,
                heavy_ac: lead.heavy_ac,
                water_heater: lead.water_heater
            };
            var outputData = lead.output_data || lead.calculation_data || {
                panels_needed: lead.panels_needed,
                system_size_kwp: lead.system_size_kwp,
                annual_production_kwh: lead.annual_production_kwh,
                roof_area_m2: lead.roof_area_m2,
                estimated_cost_azn: lead.estimated_cost_azn
            };
            var system = [
                lead.panels_needed ? lead.panels_needed + ' panels' : '',
                lead.system_size_kwp ? lead.system_size_kwp + ' kWp' : '',
                lead.annual_production_kwh ? formatNumber(lead.annual_production_kwh) + ' kWh/year' : '',
                lead.estimated_cost_azn ? formatNumber(lead.estimated_cost_azn) + ' AZN' : ''
            ].filter(Boolean).join('\n');
            return '<tr>' +
                '<td>' + esc(created) + '</td>' +
                '<td><a href="tel:' + esc(String(lead.phone_number || '').replace(/\s+/g, '')) + '">' + esc(lead.phone_number) + '</a></td>' +
                '<td>' + esc(lead.location_name || '') + '</td>' +
                '<td><pre>' + esc(system || 'No output') + '</pre></td>' +
                '<td><pre>' + formatJson(inputData) + '</pre></td>' +
                '<td><pre>' + formatJson(outputData) + '</pre></td>' +
            '</tr>';
        }).join('');
    }

    function loadDashboard() {
        if (!leadList || !analyticsCards) return;
        leadList.innerHTML = '<tr><td colspan="6">Loading leads...</td></tr>';
        api('/analytics')
            .then(function (analyticsResponse) {
                renderAnalytics(analyticsResponse.analytics);
                return api('/leads');
            })
            .then(function (leadsResponse) {
                renderLeads(leadsResponse.leads);
            })
            .catch(function (err) {
                if (err.relogin || err.code === 'DB_AUTH_FAILED') {
                    handleApiError(err, null);
                    return;
                }
                leadList.innerHTML = '<tr><td colspan="6">' + esc(err.message) + '</td></tr>';
            });
    }

    function insertMarkdown(kind) {
        var textarea = postForm.querySelector('[data-lang="' + activeLang + '"][data-field="markdown"]');
        if (!textarea) return;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var selected = textarea.value.slice(start, end) || 'text';
        var insert = selected;
        if (kind === 'bold') insert = '**' + selected + '**';
        if (kind === 'italic') insert = '*' + selected + '*';
        if (kind === 'h1') insert = '# ' + selected;
        if (kind === 'h2') insert = '## ' + selected;
        if (kind === 'h3') insert = '### ' + selected;
        if (kind === 'link') insert = '[' + selected + '](https://example.com)';
        if (kind === 'image') insert = '![' + selected + '](https://example.com/image.jpg)';
        if (kind === 'list') insert = '- ' + selected;
        if (kind === 'table') insert = '| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |';
        if (kind === 'quote') insert = '> ' + selected;
        textarea.setRangeText(insert, start, end, 'end');
        textarea.focus();
    }

    function htmlToMarkdown(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        function text(node) {
            return String(node.textContent || '').replace(/\s+/g, ' ').trim();
        }
        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
            if (node.nodeType !== Node.ELEMENT_NODE) return '';
            var tag = node.tagName.toLowerCase();
            var content = Array.prototype.map.call(node.childNodes, walk).join('').trim();
            if (tag === 'h1') return '\n# ' + content + '\n\n';
            if (tag === 'h2') return '\n## ' + content + '\n\n';
            if (tag === 'h3') return '\n### ' + content + '\n\n';
            if (tag === 'h4') return '\n#### ' + content + '\n\n';
            if (tag === 'p') return content ? content + '\n\n' : '';
            if (tag === 'strong' || tag === 'b') return '**' + content + '**';
            if (tag === 'em' || tag === 'i') return '*' + content + '*';
            if (tag === 'blockquote') return content.split('\n').map(function (line) { return line.trim() ? '> ' + line.trim() : ''; }).join('\n') + '\n\n';
            if (tag === 'br') return '\n';
            if (tag === 'a') return '[' + content + '](' + (node.getAttribute('href') || '#') + ')';
            if (tag === 'img') return '![' + (node.getAttribute('alt') || 'image') + '](' + (node.getAttribute('src') || '') + ')';
            if (tag === 'li') return '- ' + content + '\n';
            if (tag === 'ul' || tag === 'ol') return '\n' + content + '\n';
            if (tag === 'table') {
                var rows = Array.prototype.map.call(node.querySelectorAll('tr'), function (row) {
                    return Array.prototype.map.call(row.children, text);
                }).filter(function (row) { return row.length; });
                if (!rows.length) return '';
                var headers = rows[0];
                var separator = headers.map(function () { return '---'; });
                return '\n| ' + headers.join(' | ') + ' |\n| ' + separator.join(' | ') + ' |\n' +
                    rows.slice(1).map(function (row) { return '| ' + row.join(' | ') + ' |'; }).join('\n') + '\n\n';
            }
            return content;
        }
        return Array.prototype.map.call(doc.body.childNodes, walk).join('').replace(/\n{3,}/g, '\n\n').trim();
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loginError.textContent = '';
        api('/login', {
            method: 'POST',
            body: JSON.stringify({ password: document.getElementById('admin-password').value })
        }).then(showCms).catch(function (err) { loginError.textContent = err.message; });
    });

    document.querySelectorAll('.lang-tab').forEach(function (button) {
        button.addEventListener('click', function () {
            activeLang = button.dataset.lang;
            document.querySelectorAll('.lang-tab').forEach(function (btn) { btn.classList.toggle('active', btn === button); });
            document.querySelectorAll('.translation-panel').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.panel === activeLang); });
        });
    });

    document.querySelectorAll('.admin-tab').forEach(function (button) {
        button.addEventListener('click', function () {
            var section = button.dataset.section;
            document.querySelectorAll('.admin-tab').forEach(function (btn) { btn.classList.toggle('active', btn === button); });
            document.querySelectorAll('[data-admin-section]').forEach(function (panel) {
                panel.classList.toggle('active', panel.dataset.adminSection === section);
            });
            if (section === 'leads') loadDashboard();
        });
    });

    panels.addEventListener('click', function (event) {
        var button = event.target.closest('[data-md]');
        if (button) insertMarkdown(button.dataset.md);
    });

    panels.addEventListener('paste', function (event) {
        var textarea = event.target.closest('textarea[data-field="markdown"]');
        if (!textarea) return;
        var html = event.clipboardData && event.clipboardData.getData('text/html');
        if (!html) return;
        var markdown = htmlToMarkdown(html);
        if (!markdown) return;
        event.preventDefault();
        textarea.setRangeText(markdown, textarea.selectionStart, textarea.selectionEnd, 'end');
    });

    panels.addEventListener('blur', function (event) {
        if (event.target.matches('[data-field="title"]')) {
            var lang = event.target.dataset.lang;
            var slug = postForm.querySelector('[data-lang="' + lang + '"][data-field="slug"]');
            if (slug && !slug.value.trim()) slug.value = slugify(event.target.value);
        }
    }, true);

    postList.addEventListener('click', function (event) {
        var button = event.target.closest('[data-id]');
        if (!button) return;
        var post = posts.find(function (item) { return String(item.id) === String(button.dataset.id); });
        fillForm(post || emptyPost());
    });

    document.getElementById('new-post-btn').addEventListener('click', function () { fillForm(emptyPost()); });

    function submitPost(status) {
        message.textContent = '';
        var id = document.getElementById('post-id').value;
        var method = id ? 'PUT' : 'POST';
        var path = id ? '/posts/' + encodeURIComponent(id) : '/posts';
        api(path, { method: method, body: JSON.stringify(readForm(status)) })
            .then(function () {
                activePost = null;
                message.style.color = '#197245';
                message.textContent = status === 'published' ? 'Published.' : 'Draft saved.';
                return loadPosts();
            })
            .catch(function (err) {
                if (err.relogin || err.code === 'DB_AUTH_FAILED') {
                    handleApiError(err, null);
                    return;
                }
                message.style.color = '#b42318';
                message.textContent = err.message;
            });
    }

    document.getElementById('save-draft-btn').addEventListener('click', function () { submitPost('draft'); });
    document.getElementById('publish-btn').addEventListener('click', function () { submitPost('published'); });
    document.getElementById('delete-btn').addEventListener('click', function () {
        var id = document.getElementById('post-id').value;
        if (!id || !confirm('Delete this post?')) return;
        api('/posts/' + encodeURIComponent(id), { method: 'DELETE' })
            .then(function () {
                activePost = null;
                message.textContent = 'Deleted.';
                return loadPosts();
            })
            .catch(function (err) { handleApiError(err, message); });
    });
    document.getElementById('logout-btn').addEventListener('click', function () {
        api('/logout', { method: 'POST' }).then(function () { location.reload(); });
    });
    document.getElementById('refresh-leads-btn').addEventListener('click', loadDashboard);
    document.getElementById('indexnow-btn').addEventListener('click', function () {
        indexnowMessage.style.color = '#687568';
        indexnowMessage.textContent = 'Submitting URLs to IndexNow...';
        api('/indexnow', { method: 'POST' })
            .then(function (result) {
                indexnowMessage.style.color = '#197245';
                indexnowMessage.textContent = 'Submitted ' + result.submitted + ' URLs. Key file: ' + result.keyLocation;
            })
            .catch(function (err) {
                if (err.relogin || err.code === 'DB_AUTH_FAILED') {
                    handleApiError(err, null);
                    return;
                }
                indexnowMessage.style.color = '#b42318';
                indexnowMessage.textContent = err.message;
            });
    });

    buildPanels();
    api('/posts')
        .then(function (data) {
            posts = data.posts || [];
            loginPanel.hidden = true;
            cmsPanel.hidden = false;
            renderList();
            fillForm(posts[0] || emptyPost());
            loadDashboard();
        })
        .catch(function (err) {
            showLogin(err && (err.relogin || err.code === 'DB_AUTH_FAILED') ? err.message : '');
        });
})();
