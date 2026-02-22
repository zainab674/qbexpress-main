
export type PeriodKey =
    | 'today'
    | 'thisMonth'
    | 'thisQuarter'
    | 'thisYear'
    | 'lastMonth'
    | 'lastQuarter'
    | 'lastYear'
    | 'last30Days'
    | 'allTime';

export interface DateRange {
    startDate: string;
    endDate: string;
}

export const PERIODS: Record<PeriodKey, string> = {
    today: 'As of today',
    thisMonth: 'This month-to-date',
    thisQuarter: 'This quarter-to-date',
    thisYear: 'This year-to-date',
    lastMonth: 'Last month',
    lastQuarter: 'Last quarter',
    lastYear: 'Last year',
    last30Days: 'Last 30 days',
    allTime: 'All time'
};

export function getDateRangeForPeriod(period: PeriodKey): DateRange {
    const now = new Date();
    const today = formatDate(now);

    let startDate = '';
    let endDate = today;

    switch (period) {
        case 'today':
            startDate = today;
            endDate = today;
            break;
        case 'thisMonth':
            startDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
            break;
        case 'thisQuarter':
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            startDate = formatDate(new Date(now.getFullYear(), quarterStartMonth, 1));
            break;
        case 'thisYear':
            startDate = formatDate(new Date(now.getFullYear(), 0, 1));
            break;
        case 'lastMonth':
            startDate = formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            endDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 0));
            break;
        case 'lastQuarter': {
            const lastQuarterStartMonth = (Math.floor(now.getMonth() / 3) - 1) * 3;
            startDate = formatDate(new Date(now.getFullYear(), lastQuarterStartMonth, 1));
            endDate = formatDate(new Date(now.getFullYear(), lastQuarterStartMonth + 3, 0));
            break;
        }
        case 'lastYear':
            startDate = formatDate(new Date(now.getFullYear() - 1, 0, 1));
            endDate = formatDate(new Date(now.getFullYear() - 1, 11, 31));
            break;
        case 'last30Days':
            startDate = formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
            break;
        case 'allTime':
            startDate = '2000-01-01'; // Default far start
            break;
        default:
            startDate = formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    }

    return { startDate, endDate };
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}
