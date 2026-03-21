export type SubjectStatus = 'No cursada' | 'Cursando' | 'Aprobada';

export interface ProgressSubject {
    id: string;
    name: string;
    status: SubjectStatus;
}

export interface Term {
    id: string;
    name: string;
    subjects: ProgressSubject[];
}
