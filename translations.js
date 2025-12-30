// Multi-language translation system for CECSO
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
            investment: "Investment"
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
        calculator: {
            title: "Solar Calculator",
            subtitle: "Estimate your solar panel requirements for grid-tied systems in Azerbaijan",
            quickEstimate: "Quick Estimate",
            advancedCalculator: "Advanced Calculator",
            selectLocation: "Select Your Location",
            monthlyConsumption: "Monthly Electricity Consumption",
            occupancy: "Occupancy During Daytime",
            additionalAppliances: "Additional Appliances",
            calculate: "Calculate System Size"
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
            investment: "Инвестиции"
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
        calculator: {
            title: "Солнечный калькулятор",
            subtitle: "Оцените требования к солнечным панелям для систем, подключенных к сети в Азербайджане",
            quickEstimate: "Быстрая оценка",
            advancedCalculator: "Расширенный калькулятор",
            selectLocation: "Выберите ваше местоположение",
            monthlyConsumption: "Ежемесячное потребление электроэнергии",
            occupancy: "Присутствие днем",
            additionalAppliances: "Дополнительные приборы",
            calculate: "Рассчитать размер системы"
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
        calculator: {
            title: "Günəş Kalkulyatoru",
            subtitle: "Azərbaycanda şəbəkəyə qoşulmuş sistemlər üçün günəş paneli tələblərini qiymətləndirin",
            quickEstimate: "Sürətli Qiymətləndirmə",
            advancedCalculator: "Təkmilləşdirilmiş Kalkulyator",
            selectLocation: "Məkanınızı seçin",
            monthlyConsumption: "Aylıq Elektrik İstehlakı",
            occupancy: "Gündüz İşğalı",
            additionalAppliances: "Əlavə Cihazlar",
            calculate: "Sistem Ölçüsünü Hesablayın"
        }
    }
};

// Language management
let currentLanguage = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.getElementById('currentLang').textContent = lang.toUpperCase();
    updatePageLanguage();

    // Close dropdown
    document.querySelector('.language-switcher').classList.remove('active');
}

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
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentLang').textContent = currentLanguage.toUpperCase();
    updatePageLanguage();

    // Toggle dropdown
    const langBtn = document.querySelector('.lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.language-switcher').classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        const switcher = document.querySelector('.language-switcher');
        if (switcher) {
            switcher.classList.remove('active');
        }
    });
});
