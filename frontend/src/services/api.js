import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const LOGIN_ALIASES = {
  admin: "faroos952@gmail.com",
};

export const supabase = createClient(
  SUPABASE_URL || "https://missing-project.supabase.co",
  SUPABASE_ANON_KEY || "missing-anon-key",
);

function requireSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el frontend.");
  }
}

function normalizeLogin(login) {
  const value = login.trim();
  const alias = LOGIN_ALIASES[value.toLowerCase()];
  if (alias) return alias;
  if (/^\d+$/.test(value)) return `${value}@simulacion.local`;
  return value;
}

function throwIfError(error) {
  if (!error) return;
  throw new Error(error.message || "No fue posible completar la operación");
}

function cleanMutationPayload(payload) {
  const next = { ...payload };
  delete next.id;
  delete next.created_at;
  delete next.updated_at;
  return next;
}

function mapProfile(profile) {
  return {
    id: profile.id,
    username: profile.username,
    role: profile.role,
    student_id: profile.student_id,
  };
}

function mapRecord(record) {
  return {
    id: record.id,
    student_id: record.student_id,
    subject_id: record.subject_id,
    term_id: record.term_id,
    subject_clave: record.subject?.clave || "",
    subject_name: record.subject?.nombre || "",
    term_code: record.term?.codigo || "",
    evaluation_type: record.evaluation_type,
    grade: record.grade,
    acta_number: record.acta_number,
    credits: record.credits,
    status: record.status,
    planned: false,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

async function currentProfile() {
  requireSupabaseConfig();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  throwIfError(userError);
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, role, student_id")
    .eq("id", userData.user.id)
    .single();
  throwIfError(error);
  return mapProfile(data);
}

async function currentStudentId() {
  const profile = await currentProfile();
  if (!profile?.student_id) throw new Error("El perfil no tiene alumno asignado.");
  return profile.student_id;
}

function recordsQuery() {
  return supabase
    .from("academic_records")
    .select(`
      id,
      student_id,
      subject_id,
      term_id,
      evaluation_type,
      grade,
      acta_number,
      credits,
      status,
      created_at,
      updated_at,
      subject:subjects(clave,nombre),
      term:terms(codigo,fecha_inicio)
    `);
}

async function fetchRecords(studentId, term = "") {
  const query = recordsQuery()
    .eq("student_id", studentId)
    .order("id", { ascending: true });

  const { data, error } = await query;
  throwIfError(error);
  return (data || []).filter((record) => !term || record.term?.codigo === term).map(mapRecord);
}

async function fetchStudentKardex(studentId, term = "") {
  const [records, studentResult] = await Promise.all([
    fetchRecords(studentId),
    supabase
      .from("students")
      .select("current_curriculum_term,current_term_id")
      .eq("id", studentId)
      .single(),
  ]);
  throwIfError(studentResult.error);

  const curriculumTerm = studentResult.data.current_curriculum_term || 1;
  const [subjectsResult, currentTermResult] = await Promise.all([
    supabase
      .from("subjects")
      .select("id,clave,nombre,creditos,curriculum_term,activo")
      .eq("curriculum_term", curriculumTerm)
      .eq("activo", true)
      .order("clave", { ascending: true }),
    studentResult.data.current_term_id
      ? supabase
        .from("terms")
        .select("id,codigo")
        .eq("id", studentResult.data.current_term_id)
        .single()
      : Promise.resolve({ data: null, error: null }),
  ]);
  throwIfError(subjectsResult.error);
  throwIfError(currentTermResult.error);

  const registeredSubjectIds = new Set(records.map((record) => record.subject_id));
  const plannedRecords = (subjectsResult.data || [])
    .filter((subject) => !registeredSubjectIds.has(subject.id))
    .map((subject) => ({
      id: `planned-${subject.id}`,
      student_id: studentId,
      subject_id: subject.id,
      term_id: currentTermResult.data?.id || null,
      subject_clave: subject.clave,
      subject_name: subject.nombre,
      term_code: currentTermResult.data?.codigo || "",
      evaluation_type: "",
      grade: "",
      acta_number: "",
      credits: subject.creditos,
      status: "PENDIENTE",
      planned: true,
      created_at: null,
      updated_at: null,
    }));

  return [...records, ...plannedRecords]
    .filter((record) => !term || record.term_code === term);
}

export const authApi = {
  async login(username, password) {
    requireSupabaseConfig();
    const email = normalizeLogin(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    throwIfError(error);
    return { user: await currentProfile() };
  },

  me: currentProfile,

  async changePassword(payload) {
    requireSupabaseConfig();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    throwIfError(userError);
    const email = userData.user?.email;
    if (!email) throw new Error("No hay sesión activa.");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: payload.current_password,
    });
    throwIfError(authError);

    const { error } = await supabase.auth.updateUser({ password: payload.new_password });
    throwIfError(error);
    return { ok: true };
  },

  logout: () => supabase.auth.signOut(),
};

export const studentApi = {
  async me() {
    const studentId = await currentStudentId();
    const { data, error } = await supabase.from("students").select("*").eq("id", studentId).single();
    throwIfError(error);
    return data;
  },

  async records(term = "") {
    return fetchStudentKardex(await currentStudentId(), term);
  },

  async notices() {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("active", true)
      .order("published_at", { ascending: false });
    throwIfError(error);
    return data || [];
  },

  async terms() {
    const { data, error } = await supabase
      .from("terms")
      .select("*")
      .eq("activo", true)
      .order("fecha_inicio", { ascending: true });
    throwIfError(error);
    return data || [];
  },

  async profilePhoto() {
    requireSupabaseConfig();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    throwIfError(userError);
    if (!userData.user) throw new Error("No hay sesión activa.");

    const path = `${userData.user.id}/profile`;
    const { data, error } = await supabase.storage
      .from("profile-photos")
      .createSignedUrl(path, 60 * 60);

    if (error) return "";
    return `${data.signedUrl}&v=${Date.now()}`;
  },

  async uploadProfilePhoto(file) {
    requireSupabaseConfig();
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("La foto debe ser JPG, PNG o WebP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("La foto no puede pesar más de 5 MB.");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    throwIfError(userError);
    if (!userData.user) throw new Error("No hay sesión activa.");

    const path = `${userData.user.id}/profile`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, {
        cacheControl: "0",
        contentType: file.type,
        upsert: true,
      });
    throwIfError(error);

    return studentApi.profilePhoto();
  },
};

export const adminApi = {
  async students() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("first_last_name", { ascending: true })
      .order("name", { ascending: true });
    throwIfError(error);
    return data || [];
  },

  async student(id) {
    const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
    throwIfError(error);
    return data;
  },

  async createStudent(payload) {
    const studentPayload = cleanMutationPayload(payload);
    delete studentPayload.username;
    delete studentPayload.password;
    const { data, error } = await supabase.from("students").insert(studentPayload).select("*").single();
    throwIfError(error);
    return data;
  },

  async updateStudent(id, payload) {
    const { data, error } = await supabase
      .from("students")
      .update({ ...cleanMutationPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    throwIfError(error);
    return data;
  },

  records: (studentId) => fetchRecords(studentId),

  async createRecord(studentId, payload) {
    const { data, error } = await supabase
      .from("academic_records")
      .insert({ ...payload, student_id: Number(studentId) })
      .select(`
        id,
        student_id,
        subject_id,
        term_id,
        evaluation_type,
        grade,
        acta_number,
        credits,
        status,
        created_at,
        updated_at,
        subject:subjects(clave,nombre),
        term:terms(codigo,fecha_inicio)
      `)
      .single();
    if (error?.code === "23505" && error.message?.includes("academic_records_student_subject_unique")) {
      throw new Error("Esta materia ya está registrada para el alumno.");
    }
    throwIfError(error);
    return mapRecord(data);
  },

  async updateRecord(id, payload) {
    const { data, error } = await supabase
      .from("academic_records")
      .update({ ...cleanMutationPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        id,
        student_id,
        subject_id,
        term_id,
        evaluation_type,
        grade,
        acta_number,
        credits,
        status,
        created_at,
        updated_at,
        subject:subjects(clave,nombre),
        term:terms(codigo,fecha_inicio)
      `)
      .single();
    throwIfError(error);
    return mapRecord(data);
  },

  async deleteRecord(id) {
    const { error } = await supabase.from("academic_records").delete().eq("id", id);
    throwIfError(error);
    return null;
  },

  async subjects() {
    const { data, error } = await supabase.from("subjects").select("*").order("clave", { ascending: true });
    throwIfError(error);
    return data || [];
  },

  async createSubject(payload) {
    const { data, error } = await supabase.from("subjects").insert(payload).select("*").single();
    throwIfError(error);
    return data;
  },

  async updateSubject(id, payload) {
    const { data, error } = await supabase
      .from("subjects")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    throwIfError(error);
    return data;
  },

  async terms() {
    const { data, error } = await supabase.from("terms").select("*").order("fecha_inicio", { ascending: true });
    throwIfError(error);
    return data || [];
  },

  async createTerm(payload) {
    const { data, error } = await supabase.from("terms").insert(payload).select("*").single();
    throwIfError(error);
    return data;
  },

  async notices() {
    const { data, error } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
    throwIfError(error);
    return data || [];
  },

  async createNotice(payload) {
    const { data, error } = await supabase.from("notices").insert(payload).select("*").single();
    throwIfError(error);
    return data;
  },

  async updateNotice(id, payload) {
    const { data, error } = await supabase.from("notices").update(payload).eq("id", id).select("*").single();
    throwIfError(error);
    return data;
  },
};
