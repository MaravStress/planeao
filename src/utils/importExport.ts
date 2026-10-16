import { saveToLocal, loadFromLocal, STORAGE_KEYS } from '../context/LocalSave';

export const exportPageData = (page: 'work' | 'pomodoro' | 'whiteboards') => {
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
            tasks: loadFromLocal(STORAGE_KEYS.POMODORO_TASKS, []),
            settings: loadFromLocal(STORAGE_KEYS.POMODORO_SETTINGS, { focusDuration: 50, restDuration: 10 })
        };
    } else if (page === 'whiteboards') {
        data = {
            type: 'planeao-whiteboards',
            version: 1,
            whiteboards: loadFromLocal(STORAGE_KEYS.STANDALONE_WHITEBOARDS, [])
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

export const importPageData = (page: 'work' | 'pomodoro' | 'whiteboards', jsonText: string): boolean => {
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
            if (parsed.settings && typeof parsed.settings === 'object') {
                saveToLocal(STORAGE_KEYS.POMODORO_SETTINGS, parsed.settings);
            }
        } else if (page === 'whiteboards') {
            if (Array.isArray(parsed.whiteboards)) {
                saveToLocal(STORAGE_KEYS.STANDALONE_WHITEBOARDS, parsed.whiteboards);
            } else {
                alert('No se encontraron whiteboards válidos.');
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
            [STORAGE_KEYS.POMODORO_SETTINGS]: loadFromLocal(STORAGE_KEYS.POMODORO_SETTINGS, { focusDuration: 50, restDuration: 10 }),
            [STORAGE_KEYS.WORK_PROJECTS]: loadFromLocal(STORAGE_KEYS.WORK_PROJECTS, []),
            [STORAGE_KEYS.STANDALONE_WHITEBOARDS]: loadFromLocal(STORAGE_KEYS.STANDALONE_WHITEBOARDS, [])
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
