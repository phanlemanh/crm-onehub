# Kế hoạch thi công: re-mo-hinh-mac-dinh (MH2)

Hợp đồng duyệt 21/10 (d-20261021T093400Z-16). Lựa chọn ghim ở `evidence/ke-hoach.json`. T2: không Gate 1.5.

- T1 — Code sản phẩm: `DEFAULT_AGENT_MODEL.id` = `zai/glm-5.3-flash`; `hoi.maModel` = `deepseek/deepseek-v4.1-flash-1017`;
  `bangGia` thêm DeepSeek theo giá Gateway thật (0,3/1,2 USD mỗi triệu token); `soan.maModel` giữ; `docs/agent.md`. Phục vụ
  E1, E2, E3. Kiểm: test agent và db liên quan model, kho.
- T2 — Ô cơ hội: ghi ngưỡng Hỏi-6 vào phần ngưỡng, giữ bốn trường quyết định. Phục vụ E8.
- T3 — Thước `rang/so-mh2.ts`: kiểm E1, E3–E9 trên cây và bằng chứng, chiều đỏ tự chạy trên bản sao; `--pham-vi` (E7);
  `--do-tac-nhan` (5 lượt eval bộ dựng, ô Cài đặt trống, kho đo riêng) và `--do-kho` (bộ 50 câu trong phiên đo, ô Cài đặt
  đặt null) ghi bằng chứng và chi phí. Viết và chạy trên bằng chứng giả lập trước lượt đo thật.
- T4 — Đo xác nhận dưới khoá s4: Tác nhân 5 lượt rồi kho 1 lượt, trần 3 USD tiền Gateway thật. Commit bằng chứng.
