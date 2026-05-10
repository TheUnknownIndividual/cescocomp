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

    function api(path, options) {
        options = options || {};
        options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        options.credentials = 'include';
        return fetch('/api/admin' + path, options).then(function (res) {
            return res.json().then(function (body) {
                if (!res.ok) throw new Error(body.error || 'Request failed');
                return body;
            });
        });
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
                        '<button type="button" data-md="heading">H</button>' +
                        '<button type="button" data-md="link">Link</button>' +
                        '<button type="button" data-md="image">Image</button>' +
                        '<button type="button" data-md="list">List</button>' +
                        '<button type="button" data-md="quote">Quote</button>' +
                    '</div>' +
                    '<textarea data-field="markdown" data-lang="' + lang + '"></textarea>' +
                '</div>' +
                '<div class="two-col">' +
                    '<div class="field"><label>SEO title</label><input data-field="seo_title" data-lang="' + lang + '"></div>' +
                    '<div class="field"><label>SEO keywords</label><input data-field="seo_keywords" data-lang="' + lang + '"></div>' +
                '</div>' +
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
            ['title', 'slug', 'excerpt', 'markdown', 'seo_title', 'seo_description', 'seo_keywords', 'image_alt'].forEach(function (field) {
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
            ['title', 'slug', 'excerpt', 'markdown', 'seo_title', 'seo_description', 'seo_keywords', 'image_alt'].forEach(function (field) {
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
        loadPosts().catch(function (err) { message.textContent = err.message; });
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
        if (kind === 'heading') insert = '## ' + selected;
        if (kind === 'link') insert = '[' + selected + '](https://example.com)';
        if (kind === 'image') insert = '![' + selected + '](https://example.com/image.jpg)';
        if (kind === 'list') insert = '- ' + selected;
        if (kind === 'quote') insert = '> ' + selected;
        textarea.setRangeText(insert, start, end, 'end');
        textarea.focus();
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

    panels.addEventListener('click', function (event) {
        var button = event.target.closest('[data-md]');
        if (button) insertMarkdown(button.dataset.md);
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
            .catch(function (err) { message.textContent = err.message; });
    });
    document.getElementById('logout-btn').addEventListener('click', function () {
        api('/logout', { method: 'POST' }).then(function () { location.reload(); });
    });

    buildPanels();
    api('/posts')
        .then(function (data) {
            posts = data.posts || [];
            loginPanel.hidden = true;
            cmsPanel.hidden = false;
            renderList();
            fillForm(posts[0] || emptyPost());
        })
        .catch(function () {
            loginPanel.hidden = false;
            cmsPanel.hidden = true;
        });
})();
