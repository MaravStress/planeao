export interface GoogleSheetConfig {
    sheetId: string;
    apiKey: string;
}

export const getGoogleSheetConfig = (): GoogleSheetConfig | null => {
    const sheetId = localStorage.getItem('planeao_sheet_id');
    const apiKey = localStorage.getItem('planeao_api_key');

    if (sheetId && apiKey) {
        return { sheetId, apiKey };
    }
    return null;
};

// Mock function to simulate data fetching
export const fetchTasksFromSheet = async (): Promise<any[]> => {
    const config = getGoogleSheetConfig();
    if (!config) {
        console.warn('Google Sheets not configured');
        return [];
    }

    // TODO: Implement actual fetch using Google Sheets API
    // https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={apiKey}

    console.log(`Fetching from sheet ${config.sheetId} with key ${config.apiKey.substring(0, 5)}...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([]);
        }, 1000);
    });
};

export const saveTaskToSheet = async (task: any): Promise<boolean> => {
    const config = getGoogleSheetConfig();
    if (!config) {
        return false;
    }

    // TODO: Implement actual append using Google Sheets API

    console.log('Saving task to sheet:', task);
    return true;
};
