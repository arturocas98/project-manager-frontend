export const Constants = {
  zero: 0,
  routes: {
    userList: 'account-management/users/list',
    userCreate: 'account-management/users/create',
    userEdit: 'account-management/users/edit',
    roleList: 'account-management/roles/list',
    projectList: 'project-management/projects/list',
    roleCreate: 'account-management/roles/create',
    roleEdit: 'account-management/roles/edit',
    login: 'auth/login',
    newpassword: 'auth/newpassword',
    forgotpassword: 'auth/forgotpassword',
    register: 'auth/register',
    accessdenied: 'auth/accessdenied',
    error: 'auth/error',
    root: '/',
    dashboard: 'pages/dashboard',
    notFound: '/notfound',
  },
  icons: {
    dashboard: 'ph ph-house',
    customize: 'ph ph-sliders',
    recent: 'ph ph-clock',
    favorites: 'ph ph-star',
    plans: 'ph ph-projector-screen-chart',
    spaces: 'ph ph-squares-four',
    filters: 'ph ph-funnel-simple',
    panels: 'ph ph-layout',

    goals: 'ph ph-person-simple-run',
    teams: 'ph ph-users-three',
    users: 'ph ph-users',
    projects: 'ph ph-rocket-launch',
    settings: 'ph ph-gear-six',

    caretRight: 'ph ph-caret-right',
    arrowRightCircle: 'ph ph-arrow-circle-right',
  },

  defaultPaginator: { current_page: 1, total: 0, from: 0, to: 0 },
  emptyString: '',
  pageParams: {
    all: { perPage: 'all' },
    defaultPerPage: { perPage: '10' },
    fiftyPerPage: { perPage: '50' },
    thousandPerPage: { perPage: '1000' },
  },
};

export const NUMBERS = {
  ZERO_POINT_ONE: 0.1,
  MINUS_ONE: -1,
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  ELEVEN: 11,
  TWELVE: 12,
  THIRTEEN: 13,
  FIFTEEN: 15,
  EIGHTEEN: 18,
  TWENTY: 20,
  TWENTY_FIVE: 25,
  FIFTY: 50,
  SIXTY: 60,
  EIGHTY: 80,
  HUNDRED: 100,
  TWO_HUNDRED: 200,
  THREE_HUNDRED: 300,
  THREE_HUNDRED_FIFTY: 350,
  FIVE_HUNDRED: 500,
  ONE_THOUSAND: 1000,
  ONE_THOUSAND_THREE_HUNDRED: 1300,
  ONE_THOUSAND_FIVE_HUNDRED: 1500,
  THREE_THOUSAND: 3000,
  THREE_THOUSAND_SIX_HUNDRED: 3600,
  TEN_THOUSAND: 10000,
  FIFTEEN_THOUSAND: 15000,
  EIGHT_HUNDRED_THOUSAND_FOUR_HUNDRED: 86400,
};

export const REGEX = {
  EMAIL: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
  NUMBERS: /^[\d-]+$/,
  REG_NUMBER: /^[A-Za-z]{3}\d{4}$/,
  FILENAME: /filename="(.+?)"/,
  ROUTE_PARAMS_FILTER: /^filter\[(.+)]$/,
  REG_SPACE: /\s+/,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/,
  PHONE_NUMBER: /^(?!.* {2})(?!.*\+.*\+)[0-9()+\/\- ]+$/,
};

export const ERROR_FORM_VALIDATION = {
  required: 'required',
  email: 'email',
  maxlength: 'maxlength',
  minlength: 'minlength',
  min: 'min',
  max: 'max',
  pattern: 'pattern',
  _validator: '_validator',
  less: 'less',
  greater: 'greater',
};

export const DATE_FORMATS = {
  shortFormatDate: 'YYYY-MM-DD',
  shortFormatDatePipe: 'YYYY-MM-dd',
  timeFormatDate: 'YYYY-MM-DD HH:mm:ss',
  timeFormat: 'HH:mm:ss',
  localTimeFormat: 'HH:mm',
  localTimeFormat12Hours: 'h:mm a',
  localFormatDate: 'dd/MM/yyyy',
  shortLocalFormatDate: 'dd/mm/yy',
  shortLocalFormatDatePipe: 'DD/MM/YYYY',
  years: 'years',
  monthFormatDate: 'mm/yy',
  date_format_pipe: 'dd-MM-yyyy',
  build_date_format_pipe: 'dd-MM-yyyy HH:mm',
  date_format_calendar: 'dd-mm-yy',
  date_format_api: 'yyyy-MM-dd',
  hour_format_pipe: 'HH:mm:ss',
  date_and_hour_format_pipe: 'dd-MM-yyyy HH:mm:ss',
};

export const IMAGES_ASSETS = {
  LOGO: '/assets/CENTROCESAL.svg',
  PROFILE_SIDEBAR_FOOTER: 'assets/FOOTER_PROFILE_SIDEBAR.png',
  ICON_FOOTER: 'assets/layout/images/banner_footer.png',
  IMAGE_EMPTY: 'assets/imageEmpty.jpg',
};

export const LOCAL_STORAGE_KEYS = {
  theme: 'theme',
  language: 'language',
  errorMessage: 'errorMessage',
  token: 'token',
  profile: 'profile',
};

export const SEVERITY = {
  SECONDARY: 'secondary',
  WARNING: 'warning',
  DANGER: 'danger',
  CONTRAST: 'contrast',
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success',
  HELP: 'help',
};

export const TABLE_KEY_FIELDS = {
  ACTION: 'action',
};

export const I18N = {
  es: 'es',
};

export const HEADER_KEYS = {
  X_REDIRECT: 'x-redirect',
  X_LANGUAGE: 'x-language',
};

export const STATUS_CODE = {
  forbidden: 403 as number,
  internalServer: 500 as number,
  notFound: 404 as number,
  unauthorized: 401 as number,
};

export enum ROLE {
  ADMIN = 'Admin',
  DEVELOPER = 'Desarrollador',
  ADMINISTRATIVE = 'Administrativo',
}
