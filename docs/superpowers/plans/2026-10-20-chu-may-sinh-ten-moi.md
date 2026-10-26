# Kế hoạch thi công — chu-may-sinh-ten-moi (VK5)

Hợp đồng: `_acceptance/chu-may-sinh-ten-moi/contract.md` (duyệt 20/10, Phan Le Manh). Thứ tự giữ ràng buộc của AC-7:
mọi sửa ngoài lời dặn soạn commit trước, chạy `nen`, rồi mới đổi lời dặn và chạy `sau`.

1. Luật máy `packages/validation/src/ten-cu-okr.ts` + xuất subpath + bài `ten-cu-okr.spec.ts` (AC-8, E9).
2. `readTenGoc` và `TEN_GOC_DU_PHONG` trong `packages/db/src/workspace.ts` (AC-4).
3. Câu báo lỗi: `okr-config.ts` (góp vào, lấy ý kiến, cấp Công ty), `okr.service.ts:1802`, `packages/validation/src/okr-hoi-y.ts:141` (AC-1…AC-3).
4. Tên gốc ở API: bỏ `OKR.tenGoc`, `tenDonVi(r, tenGoc)` và mọi chỗ gọi; mỗi service đọc `readTenGoc` một lần (AC-4).
5. Agent-okr hỏi đáp: bỏ `TRO_LY_OKR_HOI.tenGoc`, `hoi-doc.ts` đọc `readTenGoc` (AC-4).
6. Tin nhắc `tin-nhac.ts` + sinh lại bản chụp `tin-nhac-truoc-tb1.json` + bài `okr-nhac` (AC-5).
7. Bài mới: `apps/api/test/chu-may-sinh-ten-moi.spec.ts`, `chu-may-sinh-ten-moi-goc.spec.ts`, `apps/agent/test/chu-may-sinh-ten-moi.spec.ts`, `apps/agent-okr/test/chu-may-sinh-ten-moi.spec.ts` (phần cmst-goc-hoi); sửa bài cũ ghim chữ cũ (AC-9).
8. Thước `gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs`: đổi đúng chuỗi, dòng sổ `fix` decided_by chủ kho (AC-9, Hỏi-1).
9. Commit; chạy `bun run check-types`, `lint`, bài liên quan; chạy eval soạn `--nhan nen`.
10. Lời dặn: `loi-dan-soan.ts`, `tro_ly_okr/instructions.md` + bài `cmst-loi-dan` (AC-6); commit; chạy `--nhan sau`; báo giám sát (luật 24).
11. S4.
