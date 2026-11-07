// ===== 설정 =====
const ADMIN_PW = "1234";          // 관리자 암호 (바꾸려면 여기만 수정 후 재배포)
const TZ = "Asia/Seoul";
const START = 23 * 60;            // 23:00
const END = 23 * 60 + 30;         // 23:30

const INIT = {
  "102/1202": "차지윤 이현영 정수안",
  "106/1202": "한수진 김예은 윤지연 정윤서",
  "201/501": "서민영 조성빈 차명희 이연주",
  "201/703": "이여진 김민서 박지은 서지윤",
  "201/1204": "박예진 정윤정 김서하 임성하",
  "201/1205": "신다민 장은아 이은비 정윤솔",
  "202/501": "박시유 최수연 박경림 김고은 임혜인",
  "202/701": "최다인 허윤서 이서윤 이수연",
  "202/405": "김애슬 최하경 박민혜 최서윤 정다현",
  "202/506": "구한나 손예린 홍예서 김려원"
};

// ===== 최초 1회 실행: 시트 생성 + 명단 입력 =====
function initRoster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let r = ss.getSheetByName("명단") || ss.insertSheet("명단");
  let a = ss.getSheetByName("출석") || ss.insertSheet("출석");
  r.clear(); r.appendRow(["호실", "이름"]);
  Object.keys(INIT).forEach(room => INIT[room].split(" ").forEach(n => r.appendRow([room, n])));
  if (a.getLastRow() === 0) a.appendRow(["날짜", "호실", "이름", "시각", "방식"]);
}

// ===== 유틸 =====
function now() {
  const d = new Date();
  const date = Utilities.formatDate(d, TZ, "yyyy-MM-dd");
  const mins = +Utilities.formatDate(d, TZ, "H") * 60 + +Utilities.formatDate(d, TZ, "m");
  return { ms: d.getTime(), date, mins, time: Utilities.formatDate(d, TZ, "HH:mm:ss") };
}
function sh(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function roster() {
  const v = sh("명단").getDataRange().getValues().slice(1);
  return v.filter(x => x[1]).map(x => ({ room: String(x[0]), name: String(x[1]), key: x[0] + "|" + x[1] }));
}
function todayRows(date) {
  const v = sh("출석").getDataRange().getValues();
  const out = [];
  for (let i = 1; i < v.length; i++) {
    const d = v[i][0] instanceof Date ? Utilities.formatDate(v[i][0], TZ, "yyyy-MM-dd") : String(v[i][0]);
    if (d === date) out.push({ row: i + 1, key: v[i][1] + "|" + v[i][2], time: String(v[i][3]), by: v[i][4] });
  }
  return out;
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ===== API =====
function doPost(e) {
  const q = JSON.parse(e.postData.contents), n = now();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (q.action === "state") return out({ ok: true, now: n, students: roster() });

    if (q.action === "checkin") {
      if (n.mins < START || n.mins >= END) return out({ ok: false, msg: "체크 시간이 아닙니다." });
      const s = roster().find(x => x.key === q.key);
      if (!s) return out({ ok: false, msg: "명단에 없는 학생입니다." });
      if (todayRows(n.date).some(x => x.key === q.key)) return out({ ok: true, msg: "이미 출석 처리되었습니다." });
      sh("출석").appendRow([n.date, s.room, s.name, n.time, "학생"]);
      return out({ ok: true, msg: "✅ 출석 완료!" });
    }

    // 이하 관리자 전용
    if (q.pw !== ADMIN_PW) return out({ ok: false, msg: "암호가 틀렸습니다." });
    if (q.action === "login") return out({ ok: true });
    if (q.action === "adminState") return out({ ok: true, now: n, students: roster(), checked: todayRows(n.date) });
    if (q.action === "adminSet") {
      const rows = todayRows(n.date).filter(x => x.key === q.key);
      if (q.on && !rows.length) { const [room, name] = q.key.split("|"); sh("출석").appendRow([n.date, room, name, n.time, "관리자"]); }
      if (!q.on) rows.reverse().forEach(x => sh("출석").deleteRow(x.row));
      return out({ ok: true });
    }
    if (q.action === "saveRoster") {
      const r = sh("명단"); r.clear(); r.appendRow(["호실", "이름"]);
      q.lines.forEach(l => { l = l.trim(); if (!l) return; const i = l.indexOf(" "); r.appendRow(i > 0 ? [l.slice(0, i), l.slice(i + 1).trim()] : ["", l]); });
      return out({ ok: true });
    }
    return out({ ok: false, msg: "알 수 없는 요청" });
  } finally { lock.releaseLock(); }
}
