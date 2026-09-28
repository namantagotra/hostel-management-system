const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getToken  = ()      => localStorage.getItem('hms_token');
export const setToken  = (t)     => localStorage.setItem('hms_token', t);
export const clearToken = ()     => localStorage.removeItem('hms_token');

const req = async (method, path, body = null, isFormData = false) => {
    const token = getToken();
    const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${BASE}${path}`, {
        method, headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
};

const get   = (path)                    => req('GET',    path);
const post  = (path, body, isFormData)  => req('POST',   path, body, isFormData);
const patch = (path, body)              => req('PATCH',  path, body);
const del   = (path)                    => req('DELETE', path);

export const api = {
    auth: {
        login: (email, password, role) => post('/auth/login', { email, password, role }),
        me:    ()                      => get('/auth/me'),
    },
    students: {
        getAll:     ()               => get('/students'),
        getMe:      ()               => get('/students/me'),
        register:   (data)           => post('/students', data),
        allocate:   (id, roomNumber) => patch(`/students/${id}/allocate`, { roomNumber }),
        deallocate: (id)             => patch(`/students/${id}/deallocate`),
        delete:     (id)             => del(`/students/${id}`),
    },
    rooms: {
        getAll:  ()         => get('/rooms'),
        create:  (data)     => post('/rooms', data),
        update:  (id, data) => patch(`/rooms/${id}`, data),
        delete:  (id)       => del(`/rooms/${id}`),
    },
    complaints: {
        getAll:       ()                   => get('/complaints'),
        create:       (data)               => post('/complaints', data),
        updateStatus: (id, status, reason) => patch(`/complaints/${id}/status`, { status, rejectionReason: reason }),
        delete:       (id)                 => del(`/complaints/${id}`),
    },
    outpasses: {
        getAll:       ()                   => get('/outpasses'),
        create:       (data)               => post('/outpasses', data),
        updateStatus: (id, status, reason) => patch(`/outpasses/${id}/status`, { status, rejectionReason: reason }),
    },
    attendance: {
        getAll: ()     => get('/attendance'),
        mark:   (data) => post('/attendance', data),
        delete: (id)   => del(`/attendance/${id}`),
    },
    notices: {
        getAll:  ()     => get('/notices'),
        create:  (data) => post('/notices', data),
        delete:  (id)   => del(`/notices/${id}`),
    },
    mess: {
        getSchedule:    ()       => get('/mess/schedule'),
        updateSchedule: (id, d)  => patch(`/mess/schedule/${id}`, d),
        getFeedback:    ()       => get('/mess/feedback'),
        submitFeedback: (data)   => post('/mess/feedback', data),
    },
    visitors: {
        getAll:       ()                   => get('/visitors'),
        create:       (data)               => post('/visitors', data),
        updateStatus: (id, status, reason) => patch(`/visitors/${id}/status`, { status, rejectionReason: reason }),
    },
    roomChanges: {
        getAll:       ()       => get('/roomchanges'),
        create:       (data)   => post('/roomchanges', data),
        updateStatus: (id, d)  => patch(`/roomchanges/${id}/status`, d),
    },
    fees: {
        getPayments:     ()            => get('/fees/payments'),
        submitPayment:   (formData)    => post('/fees/payments', formData, true),
        verifyPayment:   (id)          => patch(`/fees/payments/${id}/verify`),
        rejectPayment:   (id, reason)  => patch(`/fees/payments/${id}/reject`, { rejectionReason: reason }),
        getStructure:    ()            => get('/fees/structure'),
        addStructure:    (data)        => post('/fees/structure', data),
        deleteStructure: (id)          => del(`/fees/structure/${id}`),
    },
    applications: {
        getAll:  ()                    => get('/applications'),
        apply:   (data)                => post('/applications', data),
        approve: (id, roomNumber)      => patch(`/applications/${id}/approve`, { roomNumber }),
        reject:  (id, reason)          => patch(`/applications/${id}/reject`, { rejectionReason: reason }),
    },
    managers: {
        getAll:  ()     => get('/managers'),
        create:  (data) => post('/managers', data),
        delete:  (id)   => del(`/managers/${id}`),
    },
};
