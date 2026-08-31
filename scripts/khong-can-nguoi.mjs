// khong-can-nguoi.mjs — vị từ «hồ sơ verified chưa ký này còn cần người không?»
//
// Đây là câu mà lưới trước-merge (scripts/pre-merge-check.sh) hỏi một hồ sơ
// `status: verified` chưa có chữ ký, ở HAI chỗ:
//   Cổng 1 — `approved_by` rỗng ⇒ đòi làn V đúng vết (veto_state: mo, vết giờ
//            parse được, hạng T2); thiếu ⇒ VIOLATION.
//   Cổng 1 — hoặc `gate1_skipped: true` (người chủ động miễn cổng) ⇒ lưới chỉ NOTE.
//   Cổng 2 — chữ ký rỗng ⇒ đòi SÁU điều kiện xanh-sạch (xanh_sach_check):
//            verdict PASS · bypass_used không true · hạng T2 · 0 mục UNCERTAIN ·
//            «Known limits» HIỆN DIỆN-và-rỗng · «Ngoài hợp đồng» HIỆN DIỆN-và-rỗng.
//            Và TRƯỚC đó lưới chặn `enforcement_mode: off` (cổng không làm gì lúc
//            ghi) — đọc cùng khối frontmatter, nên hỏi ở đây luôn (S4-r3 bắt).
//   Và `da-veto` là phát ngôn của người: lưới chặn tới khi xử.
//
// Máy quét vào phiên (start-scan.mjs) dùng vị từ này để quyết «đã giao, không
// hiện ở mục chờ ký» hay «còn ở cổng». Vòng một của hồ sơ lan-v-khong-phai-cho-ky
// chỉ hỏi veto_state và lệch NGƯỢC chiều an toàn: hồ sơ chưa sạch biến mất khỏi
// danh sách chờ ký trong khi lưới vẫn chặn.
//
// Đây là BẢN DỰNG THỨ HAI của luật (bản một là bash trong pre-merge-check.sh),
// cố ý KHÔNG gọi chung lúc chạy: «một nguồn» giữ bằng phép đo đẳng thức trên
// chính pre-merge-check.sh (tests/plugins/lan-v.test.mjs LV5) — hai bản độc lập
// thì đột biến bên nào cũng làm phép so đỏ. Không sống ở lib/ (t3_paths) là chủ
// ý của hồ sơ T2; sổ known-limits lan-v-khong-phai-cho-ky#7 ghi lớp «hai bản dựng
// độc lập chỉ được giữ bằng ma trận fixture chọn tay» (S4-r3 từng bỏ sót hai điều kiện).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { frontmatterField, vetoGateState } = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));
const { section } = require(path.join(__dirname, '..', 'lib', 'md-section.cjs'));

// Cùng regex với bash: grep -qiE '(^|[^a-z])UNCERTAIN([^a-z]|$)' trên TRỌN file.
const UNCERTAIN_RE = /(^|[^a-z])UNCERTAIN([^a-z]|$)/i;

// Tiêu đề có mặt? — hỏi RIÊNG với «thân rỗng» (vắng ≠ rỗng). Ranh tiêu đề là
// #{2,6} — CÙNG ranh với section() của lib/md-section.cjs. Nhận cả h1 ở đây mà
// section() không nhận là h1 «Known limits» có nội dung bị đọc thành «rỗng» ⇒
// sạch giả (S4-r5 bắt; bash xanh_sach_check đang mang đúng lỗi đó — sổ #9).
function sectionState(txt, heading) {
  const has = txt.split('\n').some(l => /^#{2,6}\s+/.test(l)
    && l.replace(/^#{2,6}\s+/, '').trim().toLowerCase() === heading.toLowerCase());
  if (!has) return 'vang';
  return section(txt, heading).join('\n').trim() ? 'co' : 'rong';
}

// Sáu điều kiện xanh-sạch, CÙNG THỨ TỰ với xanh_sach_check để `why` nêu cùng
// điều kiện trượt đầu tiên. Trả { clean, why }.
export function xanhSach(contractTxt, evidenceTxt) {
  if (evidenceTxt == null) return { clean: false, why: 'không có evidence-report.md' };
  const v = (frontmatterField(evidenceTxt, 'verdict') || '').trim();
  // KCN-PASS: chỉ PASS mới sạch.
  if (v !== 'PASS') return { clean: false, why: `verdict=${v} (chỉ PASS mới xanh-sạch)` };
  const bp = (frontmatterField(evidenceTxt, 'bypass_used') || '').trim().toLowerCase();
  if (bp === 'true' || bp === '1' || bp === 'yes') return { clean: false, why: `bypass_used=${bp}` };
  // KCN-ENF: lưới chặn enforcement_mode=off TRƯỚC khi tới nhánh xanh-sạch — bỏ
  // sót là máy quét giấu đúng hồ sơ lưới đang chặn (S4-r3, chiều lệch ngược an toàn).
  const enf = (frontmatterField(evidenceTxt, 'enforcement_mode') || '').trim().toLowerCase();
  if (enf === 'off') return { clean: false, why: 'enforcement_mode=off (cổng không làm gì lúc ghi)' };
  const tier = (frontmatterField(contractTxt, 'risk_tier') || '').trim().toUpperCase();
  if (tier !== 'T2') return { clean: false, why: `hạng ${tier} (chỉ T2 được đi tiếp không ký)` };
  if (UNCERTAIN_RE.test(evidenceTxt)) return { clean: false, why: 'có mục UNCERTAIN' };
  for (const h of ['Known limits', 'Ngoài hợp đồng']) {
    const st = sectionState(evidenceTxt, h);
    if (st === 'vang') return { clean: false, why: `mục «${h}» VẮNG khỏi báo cáo (vắng ≠ rỗng)` };
    if (st === 'co') return { clean: false, why: `mục «${h}» có nội dung` };
  }
  return { clean: true, why: '' };
}

// Trả null khi hồ sơ CÒN cần người; trả tên trạng thái «đã giao» khi không:
//   'lan-v-mo'  — cửa veto ĐANG MỞ: máy đã đóng một cổng (Cổng 1 hoặc Cổng 2)
//                 với vết `veto_state: mo` — bất kể người có duyệt Cổng 1 hay không
//                 (release-2-0-0: approved_by có tên + mo ở Cổng 2 ⇒ cửa vẫn mở)
//   'xanh-sach' — không có cửa veto: người đóng/miễn Cổng 1, Cổng 2 xanh-sạch
// Thứ tự nhánh tường minh (AC-4): da-veto cắt trước → chữ ký (bên gọi xử) →
// Cổng 1 → Cổng 2.
export function khongCanNguoi(contractTxt, evidenceTxt) {
  const veto = vetoGateState(contractTxt);
  // KCN-VETO: veto là phát ngôn của người — không bao giờ «đã giao».
  if (veto.present && veto.state === 'da-veto') return null;
  // KCN-SACH: Cổng 2 — sáu điều kiện.
  if (!xanhSach(contractTxt, evidenceTxt).clean) return null;
  // Cổng 1 — người duyệt, hay máy đóng đúng vết.
  const approvedBy = (frontmatterField(contractTxt, 'approved_by') || '').trim();
  // KCN-SKIP: người chủ động miễn Cổng 1 — lưới chỉ NOTE, không chặn (cùng luật với
  // lưới ghi-lúc-viết). Khác V: đây là người miễn, V là máy đóng và người giữ veto.
  const gate1Skipped = /^(true|yes|1)$/i.test((frontmatterField(contractTxt, 'gate1_skipped') || '').trim());
  const vMo = veto.present && veto.state === 'mo' && veto.stamped && veto.tier === 'T2';
  if (vMo) return 'lan-v-mo';
  if (approvedBy || gate1Skipped) return 'xanh-sach';
  return null;
}
