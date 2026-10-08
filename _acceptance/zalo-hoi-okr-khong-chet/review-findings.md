# Review findings: zalo-hoi-okr-khong-chet (round 3)

## Trong hợp đồng

- **When the real tro_ly_okr subagent runs outside an OKR session, nothing gives the root model a reason to pass on, and the latest E8 run at HEAD is red**
  file: `apps/agent/agent/hooks/okr-uy-quyen.ts:12`
  severity: medium
  source: bugs
  AC: AC-7
  detail: Outside an OKR session the hook now only writes `[okr-uy-quyen] ngoai-okr purpose=<p>` and lets the subagent call go through. The guidance the root model should repeat (`TRO_LY_OKR.ngoaiPhien.lyDo`: point the person to OKR in OneHub Center) exists only in the `execute` of the stand-in tool `tro-ly-okr-ngoai`. docs/agent.md (eve 0.29.4) says that stand-in cannot override a subagent. On the real-subagent path, the child session finds no task: `instructions/viec.ts` returns null and `chonMoHinhTheoViec` returns null. The child replies freely and the root writes its own answer with no reason to work from. This is the AC-7 path. It is also the production path for every later Zalo turn, because eve drops `defineDynamic` tools at replay (memory note eve-bay-da-do). Measured evidence: `.acceptance-runs/zalo-hoi-okr-khong-chet/c33/ep-1/` (written 01:14 on 09/10, after HEAD 121278631 at 00:48, tree clean) has `→ subagent tro_ly_okr` and the hook line. The ZaloHoi row is `da-tra-loi`, but the Zalo reply is «Rất tiếc, thông tin về phần trăm đạt được của KR doanh thu quý này không có trong phần xem qua Zalo của OneHub Center. Bạn vui lòng mở OneHub Center trên máy tính để xem chi tiết KR.» It has no «OKR», so `loiCuaLuotXanh` check (3) fails and `c33.mjs --ep` exits 1 on run 1. The earlier ep-2 run (00:29) only passed because that model draw happened to say «OKR». Whether the reply carries the meaningful OKR pointer that AC-1/AC-7 promise is left to the model on exactly the path the fix was meant to make safe. The fix belongs in the subagent's no-task branch: return lyDo as its reply. That is outside the AC-4 file boundary (`subagents/tro_ly_okr/**`), so a person has to decide.
  rationale: AC-7 đòi mọi lượt đã chạy trên đường gọi subagent thật đều có tin trả lời chứa chữ «OKR»; lượt đo mới nhất tại HEAD trả lời không có chữ này nên phép đo c33 --ep thoát 1.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Measurement switch TRO_LY_OKR_BO_DE is honoured in production; the repo's existing test-only override is gated on NODE_ENV**
  Người dùng thấy gì: Nếu ai đó lỡ bật công tắc đo trên bản chạy thật, lớp đỡ giúp bot Zalo trả lời êm khi gặp câu hỏi OKR sẽ lặng lẽ biến mất mà không có cảnh báo nào.
  file: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`
  severity: medium
  Đề xuất: known-limits

- **The hook's 'no question text in the log' check plants the question only in callId, not in the field that carries it**
  Người dùng thấy gì: Bài kiểm tra bảo đảm nhật ký không chứa câu hỏi của người dùng chưa thật sự thử đúng chỗ chứa câu hỏi, nên nếu sau này có ai lỡ ghi câu hỏi vào nhật ký thì có thể không ai phát hiện ngay.
  file: `apps/agent/test/okr-uy-quyen-ngoai.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm-tính-một-mình: luật pham-vi.mjs không có đối chứng chứng minh chúng bắn được**
  Người dùng thấy gì: Phép kiểm tra việc sửa không đụng ra ngoài phạm vi cho phép có thể báo sạch ngay cả khi một số quy tắc của nó viết sai, vì chưa có ca thử nào chứng minh các quy tắc đó thật sự báo lỗi được.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 + 4 — Fixture viết tay theo kiểu của bên đọc, không theo khuôn action thật của eve, nên phép «lo cau hoi trong log» kiểm sai trường**
  Người dùng thấy gì: Bài kiểm tra dùng dữ liệu giả không giống lời gọi thật, nên chưa chứng minh được là câu hỏi của người dùng không bao giờ lọt vào nhật ký.
  file: `apps/agent/test/okr-uy-quyen-ngoai.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên «ma trận viết trước, bài khẳng định số dòng» nhưng phép đếm là hằng đúng và kỳ vọng suy từ luật lúc chạy**
  Người dùng thấy gì: Một phép kiểm đếm số ca thử trong bộ kiểm thử không thể báo đỏ, nên nếu sau này có thêm một loại phiên mới thì bộ kiểm thử sẽ không tự nhắc cần xem lại cách xử lý nó.
  file: `apps/agent/test/okr-uy-quyen-ngoai.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
