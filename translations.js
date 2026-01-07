// Multi-language translation system for CECSO

// Prevent multiple initializations
if (window.translationsInitialized) {
    console.warn('Translations already initialized, skipping...');
} else {
    window.translationsInitialized = true;

    const translations = {
        en: {
            nav: {
                features: "Features",
                map: "Interactive Map",
                about: "About",
                calculator: "Solar Calculator",
                framework: "Regulatory Framework",
                home: "Home",
                energyMap: "Energy Map",
                laws: "Laws",
                commitments: "Commitments",
                investment: "Investment",
                news: "News"
            },
            hero: {
                title1: "Azerbaijan's",
                title2: "Clean Energy",
                subtitle: "A comprehensive digital platform connecting renewable energy stakeholders with data-driven insights, policy frameworks, and investment opportunities across Azerbaijan's energy landscape.",
                exploreMap: "Explore Energy Map",
                viewPolicies: "View Policies"
            },
            stats: {
                potential: "Economic Renewable Potential",
                target: "Target Capacity by 2030",
                resShare: "RES Share Goal",
                policies: "Policy Frameworks"
            },
            features: {
                sectionTitle: "Empowering Clean Energy Innovation",
                sectionSubtitle: "Data-driven tools and resources for policymakers, investors, and renewable energy stakeholders",

                atlas: {
                    title: "Interactive Energy Atlas",
                    description: "Rayon-level mapping of Azerbaijan's 27 GW renewable potential with detailed solar, wind, and hydro data. Explore project pipelines, existing installations, and untapped opportunities.",
                    link: "Explore Map →"
                },
                regulatory: {
                    title: "Regulatory Framework Hub",
                    description: "Comprehensive database of Azerbaijan's green energy laws, presidential orders, NDC commitments, and investment mechanisms. Stay updated on policy evolution.",
                    link: "View Frameworks →"
                },
                investment: {
                    title: "Investment Intelligence",
                    description: "Track major renewable projects, PPAs, auction frameworks, and GW-scale MoUs with international partners like Masdar, ACWA Power, and bp.",
                    link: "Explore Projects →"
                },
                planning: {
                    title: "Strategic Planning Tools",
                    description: "Access data on green energy zones (East Zangazur, Karabakh), infrastructure capacity, grid connections, and regional export corridors.",
                    link: "View Details →"
                },
                data: {
                    title: "Academic-Grade Data",
                    description: "All energy assessments backed by peer-reviewed research, Ministry of Energy data, and World Bank reports. Verified, transparent, and actionable.",
                    link: "See Sources →"
                },
                cop29: {
                    title: "COP29 Leadership",
                    description: "Showcasing Azerbaijan's commitment to tripling global renewables by 2030 and establishing Karabakh/East Zangazur as a green recovery showcase.",
                    link: "Learn More →"
                }
            },
            map: {
                sectionTitle: "Explore Azerbaijan's Energy Landscape",
                sectionSubtitle: "Interactive rayon-level map with detailed renewable energy potential, projects, and infrastructure",
                solarTitle: "☀️ Total Solar Radiation Map of Azerbaijan",
                solarSubtitle: "Comprehensive solar irradiation distribution across Azerbaijan's territory",
                solarSource: "Source: Imamverdiyev, N.S. (2021).",
                solarSourceLink: "Geographical Investigation of Azerbaijan's Renewable Energy Resources",
                windTitle: "💨 Wind Speed Distribution in Azerbaijan (50m height)",
                windSubtitle: "Map of wind speed distribution across Azerbaijan at 50 meters above ground level",
                windSource: "Source: Wind Atlas Analysis and Application Program (WAsP).",
                windSourceLink: "Ministry of Energy wind speed data."
            },
            about: {
                sectionTitle: "About This Platform",
                mission: {
                    title: "Our Mission",
                    description: "To accelerate Azerbaijan's clean energy transition by providing stakeholders with transparent, data-driven insights into the country's renewable potential, regulatory landscape, and investment opportunities."
                },
                coverage: {
                    title: "What We Cover",
                    description: "27 GW of economic renewable potential mapped across all 66 districts, 11+ policy frameworks analyzed, Real-time tracking of GW-scale projects and international partnerships, Academic-grade data from peer-reviewed research and official sources"
                },
                audience: {
                    title: "Who It's For",
                    description: "Government agencies planning renewable energy strategies, International investors exploring Azerbaijan's green energy market, Researchers analyzing regional renewable potential, Energy companies assessing project feasibility"
                }
            },
            calculator: {
                title: "☀️ Solar Calculator",
                subtitle: "Estimate your solar panel requirements for grid-tied systems in Azerbaijan",
                locationTitle: "📍 Select Your Location",
                locationInstructions: "Click on the map or search for your city to get location-specific solar data",
                selectedLocation: "Selected",
                monthlyConsumption: "Monthly Electricity Consumption",
                monthlyConsumptionUnit: "kWh/month",
                calculateButton: "Calculate System Size",
                netMeteringTitle: "🌞 Azerbaijan's Active Consumer Support Mechanism",
                netMeteringGoodNews: "Good news!",
                netMeteringDesc: "Azerbaijan implemented a net-metering system allowing you to sell excess solar energy to Azərenerji and use it later when needed.",
                keyBenefits: "Key Benefits:",
                benefitSystemSize: "System size:",
                benefitSystemSizeDesc: "Install solar panels up to ~150 kW for residential/commercial use",
                benefitSurplus: "Surplus energy:",
                benefitSurplusDesc: "Any electricity you generate but don't use is fed into the national grid",
                benefitNight: "Night usage:",
                benefitNightDesc: "The surplus offsets your consumption later—essentially \"banking\" energy for nighttime use",
                benefitFinancial: "Financial savings:",
                benefitFinancialDesc: "Reduce or eliminate your electricity bills through net-metering",
                legalFramework: "Legal framework:",
                legalFrameworkDesc: "Approved by Cabinet of Ministers Decree No. 346 (September 28, 2023).",
                readFullDecree: "Read full decree →"
            },
            framework: {
                title: "Azerbaijan Green Energy Regulatory Framework",
                subtitle: "Comprehensive policy enablers and legal instruments for renewable energy transition",
                searchPlaceholder: "Search frameworks, policies, laws...",
                filterAll: "All",
                filterActive: "Active",
                filterImplemented: "Implemented",
                filterProgress: "In Progress",
                browseByCategory: "📍 Browse by Category",
                laws: "Laws",
                commitments: "Commitments",
                investment: "Investment",
                institutions: "Institutions",
                ministryOrders: "Ministry Orders",
                otherPolicies: "Other Policies",
                frameworks: "frameworks",
                document: "document",
                policyFrameworks: "Policy Frameworks",
                gwTarget: "GW Target by 2030",
                resShare: "RES Share Target",
                resLawEnacted: "RES Law Enacted"
            },
            news: {
                title: "🌱 Renewable Energy News",
                subtitle: "Latest developments in Azerbaijan's clean energy transition and global renewable innovations",
                attribution: "News content curated from",
                attributionNote: "All articles link to original source",
                searchPlaceholder: "Search news articles...",
                filterAll: "🌐 All News",
                filterAzerbaijan: "🇦🇿 Azerbaijan",
                filterRegion: "🌍 Region",
                filterWorld: "🗺️ World",
                filterSolar: "☀️ Solar",
                filterWind: "💨 Wind",
                filterHydro: "💧 Hydro",
                noResults: "No articles found",
                tryDifferent: "Try a different search term or category",
                backToNews: "Back to News",
                sourceAttribution: "Article Source & Attribution",
                originallyPublished: "This article was originally published on",
                curatedText: "Plugin.az curates and aggregates renewable energy news from trusted sources to provide comprehensive coverage of Azerbaijan's clean energy sector. All credit goes to the original authors and publishers.",
                readOriginal: "Read the original article:",
                relatedArticles: "Related Articles",
                noRelated: "No related articles found.",
                recent: "Recent"
            },
            footer: {
                powered: "Powered by CECSO - Clean Energy Compound System Observatory",
                source: "News aggregated from",
                home: "Home",
                map: "Energy Map",
                calculator: "Solar Calculator",
                framework: "Framework"
            }
        },
        ru: {
            nav: {
                features: "Функции",
                map: "Интерактивная карта",
                about: "О проекте",
                calculator: "Солнечный калькулятор",
                framework: "Нормативная база",
                home: "Главная",
                energyMap: "Энергетическая карта",
                laws: "Законы",
                commitments: "Обязательства",
                investment: "Инвестиции",
                news: "Новости"
            },
            hero: {
                title1: "Чистая энергия",
                title2: "Азербайджана",
                subtitle: "Комплексная цифровая платформа, объединяющая заинтересованные стороны в области возобновляемой энергии с аналитическими данными, политическими рамками и инвестиционными возможностями по всему энергетическому ландшафту Азербайджана.",
                exploreMap: "Исследовать карту",
                viewPolicies: "Просмотр политик"
            },
            stats: {
                potential: "Экономический потенциал ВИЭ",
                target: "Целевая мощность к 2030 году",
                resShare: "Цель доли ВИЭ",
                policies: "Политические рамки"
            },
            features: {
                sectionTitle: "Расширение возможностей инноваций в области чистой энергии",
                sectionSubtitle: "Инструменты и ресурсы на основе данных для политиков, инвесторов и заинтересованных сторон в области возобновляемой энергии",

                atlas: {
                    title: "Интерактивный энергетический атлас",
                    description: "Картирование 27 ГВт потенциала возобновляемой энергии Азербайджана на уровне районов с подробными данными о солнечной, ветровой и гидроэнергии. Изучайте проектные портфели, существующие установки и неиспользованные возможности.",
                    link: "Исследовать карту →"
                },
                regulatory: {
                    title: "Центр нормативно-правовой базы",
                    description: "Комплексная база данных законов Азербайджана в области зеленой энергетики, президентских указов, обязательств по ОНУВ и инвестиционных механизмов. Будьте в курсе развития политики.",
                    link: "Просмотр рамок →"
                },
                investment: {
                    title: "Инвестиционная аналитика",
                    description: "Отслеживайте крупные проекты в области возобновляемой энергии, ДПП, аукционные рамки и меморандумы о взаимопонимании на гигаваттном уровне с международными партнерами, такими как Masdar, ACWA Power и bp.",
                    link: "Исследовать проекты →"
                },
                planning: {
                    title: "Инструменты стратегического планирования",
                    description: "Доступ к данным о зонах зеленой энергии (Восточный Зангезур, Карабах), инфраструктурным мощностям, подключениям к сети и региональным экспортным коридорам.",
                    link: "Просмотр деталей →"
                },
                data: {
                    title: "Данные академического уровня",
                    description: "Все энергетические оценки подкреплены рецензируемыми исследованиями, данными Министерства энергетики и отчетами Всемирного банка. Проверено, прозрачно и действенно.",
                    link: "Смотреть источники →"
                },
                cop29: {
                    title: "Лидерство COP29",
                    description: "Демонстрация приверженности Азербайджана утроению мировых возобновляемых источников энергии к 2030 году и превращению Карабаха/Восточного Зангезура в витрину зеленого восстановления.",
                    link: "Узнать больше →"
                }
            },
            map: {
                sectionTitle: "Исследуйте энергетический ландшафт Азербайджана",
                sectionSubtitle: "Интерактивная карта на уровне районов с подробным потенциалом возобновляемой энергии, проектами и инфраструктурой",
                solarTitle: "☀️ Карта общей солнечной радиации Азербайджана",
                solarSubtitle: "Комплексное распределение солнечной ирради��ции по территории Азербайджана",
                solarSource: "Источник: Имамвердиев, Н.С. (2021).",
                solarSourceLink: "Географическое исследование ресурсов возобновляемой энергии Азербайджана",
                windTitle: "💨 Распределение скорости ветра в Азербайджане (высота 50м)",
                windSubtitle: "Карта распределения скорости ветра по Азербайджану на высоте 50 метров над уровнем земли",
                windSource: "Источник: Программа анализа и применения ветрового атласа (WAsP).",
                windSourceLink: "Данные Министерства энергетики о скорости ветра."
            },
            about: {
                sectionTitle: "О платформе",
                mission: {
                    title: "Наша миссия",
                    description: "Ускорить переход Азербайджана к чистой энергии, предоставляя заинтересованным сторонам прозрачные, основанные на данных сведения о потенциале возобновляемой энергии страны, нормативно-правовой базе и инвестиционных возможностях."
                },
                coverage: {
                    title: "Что мы охватываем",
                    description: "27 ГВт экономического потенциала возобновляемой энергии, нанесенного на карту всех 66 районов, проанализировано более 11 политических рамок, отслеживание проектов гигаваттного масштаба и международных партнерств в реальном времени, данные академического уровня из рецензируемых исследований и официальных источников"
                },
                audience: {
                    title: "Для кого это",
                    description: "Государственные учреждения, планирующие стратегии возобновляемой энергии, международные инвесторы, изучающие рынок зеленой энергии Азербайджана, исследователи, анализирующие региональный потенциал возобновляемой энергии, энергетические компании, оценивающие осуществимость проектов"
                }
            },
            calculator: {
                title: "☀️ Солнечный калькулятор",
                subtitle: "Рассчитайте требования к солнечным панелям для сетевых систем в Азербайджане",
                locationTitle: "📍 Выберите ваше местоположение",
                locationInstructions: "Нажмите на карту или найдите свой город, чтобы получить данные о солнечной энергии для конкретного места",
                selectedLocation: "Выбрано",
                monthlyConsumption: "Месячное потребление электроэнергии",
                monthlyConsumptionUnit: "кВтч/месяц",
                calculateButton: "Рассчитать размер системы",
                netMeteringTitle: "🌞 Механизм поддержки активных потребителей Азербайджана",
                netMeteringGoodNews: "Хорошие новости!",
                netMeteringDesc: "Азербайджан внедрил систему нетто-учета, позволяющую продавать избыточную солнечную энергию Азеренерджи и использовать ее позже при необходимости.",
                keyBenefits: "Основные преимущества:",
                benefitSystemSize: "Размер системы:",
                benefitSystemSizeDesc: "Установите солнечные панели мощностью до ~150 кВт для жилых/коммерческих целей",
                benefitSurplus: "Избыточная энергия:",
                benefitSurplusDesc: "Любая генерируемая, но неиспользованная электроэнергия поступает в национальную сеть",
                benefitNight: "Ночное использование:",
                benefitNightDesc: "Избыток компенсирует ваше потребление позже — по сути \"сохраняет\" энергию для ночного использования",
                benefitFinancial: "Финансовая экономия:",
                benefitFinancialDesc: "Сократите или исключите счета за электроэнергию с помощью нетто-учета",
                legalFramework: "Правовая база:",
                legalFrameworkDesc: "Утверждено Постановлением Кабинета Министров № 346 (28 сентября 2023 г.).",
                readFullDecree: "Читать полный указ →"
            },
            framework: {
                title: "Нормативно-правовая база зеленой энергетики Азербайджана",
                subtitle: "Комплексные политические инструменты и правовые механизмы для перехода к возобновляемой энергии",
                searchPlaceholder: "Поиск рамок, политик, законов...",
                filterAll: "Все",
                filterActive: "Активные",
                filterImplemented: "Реализованные",
                filterProgress: "В процессе",
                browseByCategory: "📍 Просмотр по категориям",
                laws: "Законы",
                commitments: "Обязательства",
                investment: "Инвестиции",
                institutions: "Учреждения",
                ministryOrders: "Приказы министерства",
                otherPolicies: "Другие политики",
                frameworks: "рамок",
                document: "документ",
                policyFrameworks: "Политические рамки",
                gwTarget: "Целевая мощность ГВт к 2030",
                resShare: "Целевая доля ВИЭ",
                resLawEnacted: "Закон о ВИЭ принят"
            },
            news: {
                title: "🌱 Новости возобновляемой энергии",
                subtitle: "Последние события в области перехода Азербайджана к чистой энергии и глобальные инновации в возобновляемой энергии",
                attribution: "Новостной контент собран с",
                attributionNote: "Все статьи ссылаются на исходный источник",
                searchPlaceholder: "Поиск новостных статей...",
                filterAll: "🌐 Все новости",
                filterAzerbaijan: "🇦🇿 Азербайджан",
                filterRegion: "🌍 Регион",
                filterWorld: "🗺️ Мир",
                filterSolar: "☀️ Солнечная",
                filterWind: "💨 Ветровая",
                filterHydro: "💧 Гидро",
                noResults: "Статьи не найдены",
                tryDifferent: "Попробуйте другой поисковый запрос или категорию",
                backToNews: "Назад к новостям",
                sourceAttribution: "Источник статьи и атрибуция",
                originallyPublished: "Эта статья была первоначально опубликована на",
                curatedText: "Plugin.az собирает и агрегирует новости о возобновляемой энергии из надежных источников для всестороннего освещения сектора чистой энергетики Азербайджана. Все права принадлежат оригинальным авторам и издателям.",
                readOriginal: "Читать оригинальную статью:",
                relatedArticles: "Связанные статьи",
                noRelated: "Похожие статьи не найдены.",
                recent: "Недавно"
            },
            footer: {
                powered: "При поддержке CECSO - Обсерватория комплексных систем чистой энергии",
                source: "Новости агрегированы с",
                home: "Главная",
                map: "Энергетическая карта",
                calculator: "Солнечный калькулятор",
                framework: "Нормативная база"
            }
        },
        az: {
            nav: {
                features: "Xüsusiyyətlər",
                map: "İnteraktiv Xəritə",
                about: "Haqqında",
                calculator: "Günəş Kalkulyatoru",
                framework: "Tənzimləyici Çərçivə",
                home: "Əsas səhifə",
                energyMap: "Enerji Xəritəsi",
                laws: "Qanunlar",
                commitments: "Öhdəliklər",
                news: "Xəbərlər",
                investment: "İnvestisiya"
            },
            hero: {
                title1: "Azərbaycanın",
                title2: "Təmiz Energetikası",
                subtitle: "Azərbaycanın enerji mənzərəsində bərpa olunan enerji maraqlı tərəflərini məlumat əsaslı fikirlər, siyasət çərçivələri və investisiya imkanları ilə birləşdirən hərtərəfli rəqəmsal platforma.",
                exploreMap: "Enerji Xəritəsini Kəşf Edin",
                viewPolicies: "Siyasətlərə baxın"
            },
            stats: {
                potential: "İqtisadi BEM Potensialı",
                target: "2030-cu ilə Hədəf Güc",
                resShare: "BEM Payı Hədəfi",
                policies: "Siyasət Çərçivələri"
            },
            features: {
                sectionTitle: "Təmiz Enerji İnnovasiyasının Güclənd��rilməsi",
                sectionSubtitle: "Siyasətçilər, investorlar və bərpa olunan enerji maraqlı tərəfləri üçün məlumat əsaslı alətlər və resurslar",

                atlas: {
                    title: "İnteraktiv Enerji Atlası",
                    description: "Ətraflı günəş, külək və hidro məlumatları ilə Azərbaycanın 27 GW bərpa olunan potensialının rayon səviyyəsində xəritələşdirilməsi. Layihə portfellərini, mövcud quraşdırmaları və istifadə olunmamış imkanları araşdırın.",
                    link: "Xəritəni Kəşf Edin →"
                },
                regulatory: {
                    title: "Tənzimləyici Çərçivə Mərkəzi",
                    description: "Azərbaycanın yaşıl enerji qanunları, prezident sərəncamları, MÖTÖ öhdəlikləri və investisiya mexanizmlərinin hərtərəfli məlumat bazası. Siyasət təkamülündən xəbərdar olun.",
                    link: "Çərçivələrə Baxın →"
                },
                investment: {
                    title: "İnvestisiya İntelligensiyası",
                    description: "Masdar, ACWA Power və bp kimi beynəlxalq tərəfdaşlarla əsas bərpa olunan enerji layihələrini, PPA-ları, hərrac çərçivələrini və GW miqyaslı Anlaşma Memorandumlarını izləyin.",
                    link: "Layihələri Kəşf Edin →"
                },
                planning: {
                    title: "Strateji Planlaşdırma Alətləri",
                    description: "Yaşıl enerji zonalarına (Şərqi Zəngəzur, Qarabağ), infrastruktur gücünə, şəbəkə birləşmələrinə və regional ixrac dəhlizlərinə dair məlumatlara giriş.",
                    link: "Təfərrüatlara Baxın →"
                },
                data: {
                    title: "Akademik Səviyyəli Məlumatlar",
                    description: "Bütün enerji qiymətləndirmələri həmyaşıdlar tərəfindən nəzərdən keçirilmiş tədqiqatlar, Energetika Nazirliyi məlumatları və Dünya Bankı hesabatları ilə dəstəklənir. Yoxlanılmış, şəffaf və təsirli.",
                    link: "Mənbələrə Baxın →"
                },
                cop29: {
                    title: "COP29 Liderliyi",
                    description: "Azərbaycanın 2030-cu ilə qədər qlobal bərpa olunanları üç dəfə artırmaq və Qarabağ/Şərqi Zəngəzuru yaşıl bərpa vitrini kimi qurmaq öhdəliyinin nümayişi.",
                    link: "Daha Çox Öyrənin →"
                }
            },
            map: {
                sectionTitle: "Azərbaycanın Enerji Mənzərəsini Kəşf Edin",
                sectionSubtitle: "Ətraflı bərpa olunan enerji potensialı, layihələr və infrastruktur ilə rayon səviyyəsində interaktiv xəritə",
                solarTitle: "☀️ Azərbaycanın Ümumi Günəş Radiasiyası Xəritəsi",
                solarSubtitle: "Azərbaycan ərazisində hərtərəfli günəş şüalanması paylanması",
                solarSource: "Mənbə: İmamverdiyev, N.S. (2021).",
                solarSourceLink: "Azərbaycanın Bərpa Olunan Enerji Ehtiyatlarının Coğrafi Tədqiqi",
                windTitle: "💨 Azərbaycanda Külək Sürətinin Paylanması (50m hündürlük)",
                windSubtitle: "Yer səviyyəsindən 50 metr yüksəklikdə Azərbaycanda külək sürətinin paylanması xəritəsi",
                windSource: "Mənbə: Külək Atlası Təhlil və Tətbiq Proqramı (WAsP).",
                windSourceLink: "Energetika Nazirliyinin külək sürəti məlumatları."
            },
            about: {
                sectionTitle: "Platforma Haqqında",
                mission: {
                    title: "Missiyamız",
                    description: "Maraqlı tərəflərə ölkənin bərpa olunan potensialı, tənzimləyici mənzərə və investisiya imkanları haqqında şəffaf, məlumat əsaslı fikirlər təqdim etməklə Azərbaycanın təmiz enerjiyə keçidini sürətləndirmək."
                },
                coverage: {
                    title: "Nəyi Əhatə Edirik",
                    description: "Bütün 66 rayonda xəritələşdirilmiş 27 GW iqtisadi bərpa olunan potensial, 11+ siyasət çərçivəsi təhlil edilib, GW miqyaslı layihələrin və beynəlxalq tərəfdaşlıqların real vaxt rejimində izlənməsi, həmyaşıdlar tərəfindən nəzərdən keçirilmiş tədqiqatlar və rəsmi mənbələrdən akademik səviyyəli məlumatlar"
                },
                audience: {
                    title: "Kim Üçündür",
                    description: "Bərpa olunan enerji strategiyalarını planlaşdıran dövlət qurumları, Azərbaycanın yaşıl enerji bazarını araşdıran beynəlxalq investorlar, regional bərpa olunan potensialı təhlil edən tədqiqatçılar, layihə həyata keçirilməsini qiymətləndirən enerji şirkətləri"
                }
            },
            calculator: {
                title: "☀️ Günəş Kalkulyatoru",
                subtitle: "Azərbaycanda şəbəkəyə qoşulmuş sistemlər üçün günəş paneli tələblərini qiymətləndirin",
                locationTitle: "📍 Məkanınızı Seçin",
                locationInstructions: "Məkan üçün xüsusi günəş məlumatları əldə etmək üçün xəritəyə klikləyin və ya şəhərinizi axtarın",
                selectedLocation: "Seçilmiş",
                monthlyConsumption: "Aylıq Elektrik İstehlakı",
                monthlyConsumptionUnit: "kVt·saat/ay",
                calculateButton: "Sistem Ölçüsünü Hesablayın",
                netMeteringTitle: "🌞 Azərbaycanın Aktiv İstehlakçı Dəstək Mexanizmi",
                netMeteringGoodNews: "Yaxşı xəbər!",
                netMeteringDesc: "Azərbaycan artıq günəş enerjisini Azərenerji-yə satmağa və lazım olduqda istifadə etməyə imkan verən xalis ölçmə sistemini tətbiq etdi.",
                keyBenefits: "Əsas Üstünlüklər:",
                benefitSystemSize: "Sistem ölçüsü:",
                benefitSystemSizeDesc: "Yaşayış/kommersiya məqsədləri üçün ~150 kVt-a qədər günəş paneli quraşdırın",
                benefitSurplus: "Artıq enerji:",
                benefitSurplusDesc: "İstehsal etdiyiniz, lakin istifadə etmədiyiniz hər hansı elektrik milli şəbəkəyə verilir",
                benefitNight: "Gecə istifadəsi:",
                benefitNightDesc: "Artıqlıq sonradan istehlakınızı kompensasiya edir — əslində gecə istifadəsi üçün enerji \"bank\"laşdırır",
                benefitFinancial: "Maliyyə qənaəti:",
                benefitFinancialDesc: "Xalis ölçmə vasitəsilə elektrik xərclərini azaldın və ya aradan qaldırın",
                legalFramework: "Hüquqi çərçivə:",
                legalFrameworkDesc: "Nazirlər Kabinetinin 346 nömrəli Qərarı ilə təsdiq edilmişdir (28 sentyabr 2023).",
                readFullDecree: "Tam fərmanı oxuyun →"
            },
            framework: {
                title: "Azərbaycanın Yaşıl Enerji Tənzimləyici Çərçivəsi",
                subtitle: "Bərpa olunan enerjiyə keçid üçün hərtərəfli siyasət dəstək mexanizmləri və hüquqi alətlər",
                searchPlaceholder: "Çərçivələr, siyasətlər, qanunlar axtarın...",
                filterAll: "Hamısı",
                filterActive: "Aktiv",
                filterImplemented: "Həyata keçirilmiş",
                filterProgress: "İcra olunur",
                browseByCategory: "📍 Kateqoriya üzrə baxın",
                laws: "Qanunlar",
                commitments: "Öhdəliklər",
                investment: "İnvestisiya",
                institutions: "Qurumlar",
                ministryOrders: "Nazirlik Sərəncamları",
                otherPolicies: "Digər Siyasətlər",
                frameworks: "çərçivələr",
                document: "sənəd",
                policyFrameworks: "Siyasət Çərçivələri",
                gwTarget: "2030-cu ilə GW Hədəfi",
                resShare: "BEM Payı Hədəfi",
                resLawEnacted: "BEM Qanunu Qəbul Edilib"
            },
            news: {
                title: "🌱 Bərpa Olunan Enerji Xəbərləri",
                subtitle: "Azərbaycanın təmiz enerjiyə keçidində son inkişaflar və qlobal bərpa olunan enerji yenilikləri",
                attribution: "Xəbər məzmunu aşağıdakı mənbədən toplanmışdır",
                attributionNote: "Bütün məqalələr orijinal mənbəyə keçid verir",
                searchPlaceholder: "Xəbər məqalələrini axtarın...",
                filterAll: "🌐 Bütün Xəbərlər",
                filterAzerbaijan: "🇦🇿 Azərbaycan",
                filterRegion: "🌍 Region",
                filterWorld: "🗺️ Dünya",
                filterSolar: "☀️ Günəş",
                filterWind: "💨 Külək",
                filterHydro: "💧 Hidro",
                noResults: "Heç bir məqalə tapılmadı",
                tryDifferent: "Fərqli axtarış termini və ya kateqoriya sınayın",
                backToNews: "Xəbərlərə qayıt",
                sourceAttribution: "Məqalənin Mənbəyi və İstinad",
                originallyPublished: "Bu məqalə ilk dəfə nəşr olunub",
                curatedText: "Plugin.az Azərbaycanın təmiz enerji sektorunun hərtərəfli əhatəsini təmin etmək üçün etibarlı mənbələrdən bərpa olunan enerji xəbərlərini toplayır və təqdim edir. Bütün kreditlər orijinal müəlliflərə və naşirlərə aiddir.",
                readOriginal: "Orijinal məqaləni oxuyun:",
                relatedArticles: "Əlaqəli Məqalələr",
                noRelated: "Əlaqəli məqalə tapılmadı.",
                recent: "Son"
            },
            footer: {
                powered: "CECSO tərəfindən dəstəklənir - Təmiz Enerji Kompleks Sistem Rəsədxanası",
                source: "Xəbərlər aşağıdakı mənbədən toplanıb",
                home: "Əsas səhifə",
                map: "Enerji Xəritəsi",
                calculator: "Günəş Kalkulyatoru",
                framework: "Tənzimləyici Çərçivə"
            }
        }
    };

    // Detect language based on IP and keyboard settings
    async function detectUserLanguage() {
        try {
            // First, try to detect keyboard language
            if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
                const layoutMap = await navigator.keyboard.getLayoutMap();
                // This is experimental, but we'll try it
                console.log('Keyboard layout detected');
            }

            // Check browser language for keyboard settings
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang) {
                const langCode = browserLang.toLowerCase();
                if (langCode.startsWith('az')) {
                    return 'az'; // Azerbaijani keyboard
                } else if (langCode.startsWith('ru')) {
                    return 'ru'; // Russian keyboard
                }
            }

            // Fallback: detect country via IP address using a free geolocation API
            try {
                const response = await fetch('https://ipapi.co/json/', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    const countryCode = data.country_code;

                    if (countryCode === 'AZ') {
                        // User is in Azerbaijan, default to Azerbaijani
                        return 'az';
                    }
                    // Check for Russian-speaking countries
                    const russianCountries = ['RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'TM'];
                    if (russianCountries.includes(countryCode)) {
                        return 'ru';
                    }
                }
            } catch (ipError) {
                console.log('IP geolocation not available:', ipError);
            }

            // Default to English if no detection works
            return 'en';
        } catch (error) {
            console.log('Language detection error:', error);
            return 'en';
        }
    }

    // Language management
    let currentLanguage = localStorage.getItem('language') || null;

    // Auto-detect language on first visit
    if (!currentLanguage) {
        detectUserLanguage().then(detectedLang => {
            currentLanguage = detectedLang;
            localStorage.setItem('language', detectedLang);
            const currentLangElement = document.getElementById('currentLang');
            const currentLangMobile = document.getElementById('currentLangMobile');
            if (currentLangElement) currentLangElement.textContent = detectedLang.toUpperCase();
            if (currentLangMobile) currentLangMobile.textContent = detectedLang.toUpperCase();
            document.body.setAttribute('data-lang', detectedLang);
            updatePageLanguage();
        });
        currentLanguage = 'en'; // Temporary default while detecting
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        const currentLangElement = document.getElementById('currentLang');
        const currentLangMobile = document.getElementById('currentLangMobile');
        if (currentLangElement) currentLangElement.textContent = lang.toUpperCase();
        if (currentLangMobile) currentLangMobile.textContent = lang.toUpperCase();

        // set attribute for CSS-based toggling
        document.body.setAttribute('data-lang', lang);

        updatePageLanguage();

        // Close dropdown
        const switchers = document.querySelectorAll('.language-switcher');
        switchers.forEach(s => s.classList.remove('active'));
        
        // Dispatch custom event for language change (for news page to re-render)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
    window.setLanguage = setLanguage;

    function updatePageLanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.getAttribute('data-i18n').split('.');
            let translation = translations[currentLanguage];

            for (const key of keys) {
                translation = translation[key];
                if (!translation) break;
            }

            if (translation) {
                element.textContent = translation;
            }
        });

        // Also update elements with data-translate attribute (alternative)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const keys = element.getAttribute('data-translate').split('.');
            let translation = translations[currentLanguage];

            for (const key of keys) {
                translation = translation[key];
                if (!translation) break;
            }

            if (translation) {
                element.textContent = translation;
            }
        });
    }

    // Make updateTranslations available globally
    window.updateTranslations = updatePageLanguage;
    window.translations = translations;
    window.getCurrentLanguage = () => currentLanguage;

    // Initialize language on page load
    document.addEventListener('DOMContentLoaded', () => {
        if (window.languageSystemReady) {
            console.log('Language system already initialized');
            return;
        }
        window.languageSystemReady = true;

        const currentLangElement = document.getElementById('currentLang');
        const currentLangMobile = document.getElementById('currentLangMobile');
        if (currentLangElement) {
            currentLangElement.textContent = currentLanguage.toUpperCase();
        }
        if (currentLangMobile) {
            currentLangMobile.textContent = currentLanguage.toUpperCase();
        }
        document.body.setAttribute('data-lang', currentLanguage);
        updatePageLanguage();

        // Toggle dropdown
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(langBtn => {
            if (langBtn) {
                langBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const switcher = langBtn.closest('.language-switcher');
                    switcher.classList.toggle('active');
                });
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const switchers = document.querySelectorAll('.language-switcher');
            switchers.forEach(switcher => {
                if (switcher) {
                    switcher.classList.remove('active');
                }
            });
        });
    }, { once: true });

} // End of translationsInitialized check
