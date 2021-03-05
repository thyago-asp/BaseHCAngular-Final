import * as moment from 'moment';

export const PERIOD_TYPES = {
    ['24h']: {
        label: 'LAST_HOURS_24',
        filter: { dateFrom: moment().subtract(1,'d').format('YYYY-MM-DD'), dateTo: moment().format('YYYY-MM-DD') }
    },
    ['7d']: {
        label: 'LAST_DAYS_7',
        filter: { dateFrom: moment().subtract(7,'d').format('YYYY-MM-DD'), dateTo: moment().format('YYYY-MM-DD') }
    },
    ['30d']: {
        label: 'LAST_DAYS_30',
        filter: { dateFrom: moment().subtract(30,'d').format('YYYY-MM-DD'), dateTo: moment().format('YYYY-MM-DD') }
    },
    ['1y']: {
        label: 'LAST_MONTHS_12',
        filter: { dateFrom: moment().subtract(365,'d').format('YYYY-MM-DD'), dateTo: moment().format('YYYY-MM-DD') }
    },
    ['all']: {
        label: 'ALL',
        filter: { dateFrom: moment().subtract(1095,'d').format('YYYY-MM-DD'), dateTo: moment().format('YYYY-MM-DD') }
    }
}