import { saveToLocal, loadFromLocal, STORAGE_KEYS } from '../context/LocalSave';

export const exportPageData = (page: 'work' | 'pomodoro' | 'finances' | 'ideas' | 'uni-progress') => {
    let data: any = {};
    let fileName = `planeao-${page}`;

    if (page === 'work') {
        data = {
            type: 'planeao-work',
            version: 1,
            projects: loadFromLocal(STORAGE_KEYS.WORK_PROJECTS, [])
        };
    } else if (page === 'pomodoro') {
        data = {
            type: 'planeao-pomodoro',
            version: 1,
            tasks: loadFromLocal(STORAGE_KEYS.POMODORO_TASKS, [])
        };
    } else if (page === 'finances') {
        data = {
            type: 'planeao-finances',
            version: 1,
            transactions: loadFromLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, []),
            exchangeRate: loadFromLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, 60),
            recurring: loadFromLocal(STORAGE_KEYS.FINANCE_RECURRING, []),
            fixedIncomes: loadFromLocal(STORAGE_KEYS.FINANCE_RECURRING_INCOMES, []),
            incomes: loadFromLocal(STORAGE_KEYS.FINANCE_INCOMES, []),
            quickExpenses: loadFromLocal(STORAGE_KEYS.FINANCE_QUICK_EXPENSES, [])
        };
    } else if (page === 'ideas') {
        const localIdeas = loadFromLocal(STORAGE_KEYS.IDEAS, null) || loadFromLocal(STORAGE_KEYS.IDEAS_BACKUP, []);
        const localSettings = loadFromLocal(STORAGE_KEYS.IDEA_SETTINGS, null) || loadFromLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, null);
        data = {
            type: 'planeao-ideas',
            version: 1,
            ideas: localIdeas,
            settings: localSettings
        };
    } else if (page === 'uni-progress') {
        data = {
            type: 'planeao-uni-progress',
            version: 1,
            terms: loadFromLocal(STORAGE_KEYS.UNI_PROGRESS_TERMS, [])
        };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importPageData = (page: 'work' | 'pomodoro' | 'finances' | 'ideas' | 'uni-progress', jsonText: string): boolean => {
    try {
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object') {
            alert('El archivo JSON no es válido.');
            return false;
        }

        // Validate type
        const expectedType = `planeao-${page}`;
        if (parsed.type !== expectedType) {
            if (!window.confirm(`El tipo de archivo (${parsed.type}) no coincide con el esperado (${expectedType}). ¿Deseas continuar?`)) {
                return false;
            }
        }

        if (page === 'work') {
            if (Array.isArray(parsed.projects)) {
                saveToLocal(STORAGE_KEYS.WORK_PROJECTS, parsed.projects);
            } else {
                alert('No se encontraron proyectos válidos.');
                return false;
            }
        } else if (page === 'pomodoro') {
            if (Array.isArray(parsed.tasks)) {
                saveToLocal(STORAGE_KEYS.POMODORO_TASKS, parsed.tasks);
            } else {
                alert('No se encontraron tareas de pomodoro válidas.');
                return false;
            }
        } else if (page === 'finances') {
            if (parsed.transactions) saveToLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, parsed.transactions);
            if (parsed.exchangeRate !== undefined) saveToLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, parsed.exchangeRate);
            if (parsed.recurring) saveToLocal(STORAGE_KEYS.FINANCE_RECURRING, parsed.recurring);
            if (parsed.fixedIncomes) saveToLocal(STORAGE_KEYS.FINANCE_RECURRING_INCOMES, parsed.fixedIncomes);
            if (parsed.incomes) saveToLocal(STORAGE_KEYS.FINANCE_INCOMES, parsed.incomes);
            if (parsed.quickExpenses) saveToLocal(STORAGE_KEYS.FINANCE_QUICK_EXPENSES, parsed.quickExpenses);
        } else if (page === 'ideas') {
            if (parsed.ideas) {
                saveToLocal(STORAGE_KEYS.IDEAS, parsed.ideas);
                saveToLocal(STORAGE_KEYS.IDEAS_BACKUP, parsed.ideas);
            }
            if (parsed.settings) {
                saveToLocal(STORAGE_KEYS.IDEA_SETTINGS, parsed.settings);
                saveToLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, parsed.settings);
            }
        } else if (page === 'uni-progress') {
            if (Array.isArray(parsed.terms)) {
                saveToLocal(STORAGE_KEYS.UNI_PROGRESS_TERMS, parsed.terms);
            } else {
                alert('No se encontró progreso universitario válido.');
                return false;
            }
        }

        return true;
    } catch (e) {
        console.error(e);
        alert('Error al procesar el archivo JSON: ' + (e as Error).message);
        return false;
    }
};

export const exportAllData = () => {
    const data = {
        type: 'planeao-database',
        version: 1,
        timestamp: Date.now(),
        data: {
            [STORAGE_KEYS.POMODORO_TASKS]: loadFromLocal(STORAGE_KEYS.POMODORO_TASKS, []),
            [STORAGE_KEYS.WORK_PROJECTS]: loadFromLocal(STORAGE_KEYS.WORK_PROJECTS, []),
            [STORAGE_KEYS.FINANCE_TRANSACTIONS]: loadFromLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, []),
            [STORAGE_KEYS.FINANCE_EXCHANGE_RATE]: loadFromLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, 60),
            [STORAGE_KEYS.FINANCE_RECURRING]: loadFromLocal(STORAGE_KEYS.FINANCE_RECURRING, []),
            [STORAGE_KEYS.FINANCE_RECURRING_INCOMES]: loadFromLocal(STORAGE_KEYS.FINANCE_RECURRING_INCOMES, []),
            [STORAGE_KEYS.FINANCE_INCOMES]: loadFromLocal(STORAGE_KEYS.FINANCE_INCOMES, []),
            [STORAGE_KEYS.FINANCE_QUICK_EXPENSES]: loadFromLocal(STORAGE_KEYS.FINANCE_QUICK_EXPENSES, []),
            [STORAGE_KEYS.IDEAS]: loadFromLocal(STORAGE_KEYS.IDEAS, null) || loadFromLocal(STORAGE_KEYS.IDEAS_BACKUP, []),
            [STORAGE_KEYS.IDEA_SETTINGS]: loadFromLocal(STORAGE_KEYS.IDEA_SETTINGS, null) || loadFromLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, null),
            [STORAGE_KEYS.UNI_PROGRESS_TERMS]: loadFromLocal(STORAGE_KEYS.UNI_PROGRESS_TERMS, [])
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planeao-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importAllData = (jsonText: string): boolean => {
    try {
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object') {
            alert('El archivo JSON no es válido.');
            return false;
        }

        if (parsed.type !== 'planeao-database') {
            if (!window.confirm(`El tipo de archivo (${parsed.type}) no coincide con el esperado (planeao-database). ¿Deseas continuar?`)) {
                return false;
            }
        }

        const dataObj = parsed.data || {};

        // Import each key using saveToLocal to trigger online sync
        Object.entries(dataObj).forEach(([key, val]) => {
            const isValidKey = Object.values(STORAGE_KEYS).includes(key as any);
            if (isValidKey) {
                if (key === STORAGE_KEYS.IDEAS) {
                    saveToLocal(STORAGE_KEYS.IDEAS_BACKUP, val);
                } else if (key === STORAGE_KEYS.IDEA_SETTINGS) {
                    saveToLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, val);
                }
                saveToLocal(key as any, val);
            }
        });

        return true;
    } catch (e) {
        console.error(e);
        alert('Error al importar la base de datos: ' + (e as Error).message);
        return false;
    }
};

export const triggerImportFile = (onDataLoaded: (jsonText: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            onDataLoaded(text);
        };
        reader.readAsText(file);
    };
    input.click();
};
