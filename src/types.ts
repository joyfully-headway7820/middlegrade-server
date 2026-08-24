export type UserGroup = {
  group_status: number;
  is_primary: boolean;
  id: number;
  name: string;
};

export type GamingPoints = {
  new_gaming_point_types__id: number;
  points: number;
};

export type UserInfo = {
  groups: UserGroup[];
  manual_link: string | null;
  student_id: number;
  current_group_id: number;
  full_name: string;
  achieves_count: number;
  stream_id: number;
  stream_name: string;
  group_name: string;
  level: number;
  photo: string;
  gaming_points: GamingPoints[];
  spent_gaming_points: GamingPoints[];
  visibility: Record<string, boolean>;
  current_group_status: number;
  birthday: string;
  last_date_visit: string;
  registration_date: string;
  gender: number;
  study_form_short_name: string;
};

export type StudentVisit = {
  date_visit: string;
  lesson_number: number;
  status_was: number;
  spec_id: number;
  teacher_name: string;
  spec_name: string;
  lesson_theme: string;
  control_work_mark: number | null;
  home_work_mark: number | null;
  lab_work_mark: number | null;
  class_work_mark: number | null;
  practical_work_mark: number | null;
  final_work_mark: number | null;
};

export type StudentExam = {
  teacher: string | null;
  mark: number | null;
  mark_type: number | null;
  date: string | null;
  ex_file_name: string | null;
  id_file: number | null;
  exam_id: number | null;
  file_path: string | null;
  comment_teach: string | null;
  need_access: number;
  need_access_stud: number | null;
  comment_delete_file: string | null;
  spec: string;
};

export type ScheduleLesson = {
  date: string;
  lesson: number;
  started_at: string;
  finished_at: string;
  teacher_name: string;
  subject_name: string;
  room_name: string;
};

export type AcademicPerformance = {
  diffMonth: number;
  totalMonth: number;
  totalAllTime: number;
  maxAllowedPoint: number;
  progress: {
    classwork: number;
    control: number;
    coursework: number;
    exams: number;
    homework: number;
    laboratory: number;
    testing: number;
    total: number;
  };
};

export type AttendanceStatistic = {
  diffMonth: number;
  diffWeek: number;
  statMonth: number;
  statWeek: number;
  statTotal: number;
};

export type ChartPoint = {
  date: string;
  points: number | null;
  previous_points: number | null;
  has_rasp: boolean | null;
};

export type LeaderboardEntry = {
  id: number;
  full_name: string;
  photo_path: string;
  position: number;
  amount: number;
};

export type LeaderboardSummary = {
  totalCount: number | null;
  studentPosition: number;
  weekDiff: number;
  monthDiff: number;
};

export type ActivityEntry = {
  date: string;
  action: number;
  current_point: number;
  point_types_id: number;
  point_types_name: string;
  achievements_id: number;
  achievements_name: string;
  achievements_type: number;
  badge: number;
  old_competition: boolean;
};

export type HomeworkItem = {
  id: number;
  id_spec: number;
  id_teach: number;
  id_group: number;
  fio_teach: string;
  theme: string;
  completion_time: string;
  creation_time: string;
  overdue_time: string;
  filename: string | null;
  file_path: string;
  comment: string;
  name_spec: string;
  status: number;
  common_status: number | null;
  cover_image: string | null;
  homework_stud: {
    id: number;
    filename: string | null;
    file_path: string;
    tmp_file: string | null;
    mark: number | null;
    creation_time: string;
    stud_answer: string | null;
    auto_mark: boolean;
  } | null;
  homework_comment: {
    text_comment: string | null;
    attachment: string | null;
    attachment_path: string | null;
    date_updated: string;
  } | null;
};

/** Журнал отдаёт список либо массивом, либо конвертом с метаданными пагинации. */
export type HomeworkListResponse =
  | HomeworkItem[]
  | {
      data: HomeworkItem[];
      _meta?: { currentPage?: number; totalPages?: number };
    };

export type HomeworkPage = {
  items: HomeworkItem[];
  page: number;
  totalPages: number;
};

export type PaymentHistoryEntry = {
  date: string;
  amount: number;
  description: string;
  type: number;
};

export type PaymentScheduleEntry = {
  id: number;
  description: string;
  price: number;
  payment_date: string;
  status: number;
};

export type PaymentInfo = {
  full_name: string;
  city_id: number;
  one_c_code: string;
  account_amount: number | null;
  has_invoice_access: boolean;
  instruction_link: string | null;
  online_link: string | null;
  payment: {
    id: number;
    fio_stud: string;
    one_c_code: string;
    date_start: string;
    amount_debt: number | null;
    pay_date_start: string;
    amount_next: number;
    purpose_of_payment: string;
    okpo: string;
    settlement_account: string;
    mfo: string;
    bank_name: string;
    organization_name: string;
    organization_address: string;
    organization_phone: string;
    organization_status: string;
    payer_full_name: string;
    amount_in_words: string;
    amount_to_pay: number;
    updated_at: string;
  } | null;
};

export type StudentReview = {
  date: string;
  teacher: string;
  spec: string;
  full_spec: string;
  message: string;
};

export type HomeworkCount = {
  counter_type: number;
  counter: number;
};

export type QuarterlyGrades = {
  grades: unknown[];
};
