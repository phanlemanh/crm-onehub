# Neo thước tự hết hạn (F8) — thiết kế

Hàng F8 của `docs/plan/lo-trinh-okr.json` (đợt r2, dãy P7). Câu giao: «Ghim lại các hồ sơ đã ký chạy
được». Ghi chú của hàng: «E23/E25 so-okr-tu-chay, E7 cap-nhat-tuan-okr, E5 và Ngoài-3
lam-moi-chuyen-viec».

## Đo ở mốc nền (onehub `aba7f6418`, 15/10)

| Hồ sơ | Eval | Lệnh | Kết quả |
|---|---|---|---|
| so-okr-tu-chay | E23 | `sot_san_thiet_ke` | mã 2 «KHONG DO DUOC: diff khong co tep giao dien apps/app nao» |
| so-okr-tu-chay | E25 | `sot_migration_chi_them` | mã 2 «KHONG DO DUOC: khong co migration moi nao so voi origin/onehub» |
| lam-moi-chuyen-viec-qua-loi-chung | E5 | `lmcv_khong_hoi_quy` | mã 2 «khong doc duoc …/zalo-gui-hong-ghi-ly-do/evals.yaml — YAML Parse error» |
| cap-nhat-tuan-okr | E7 | `cnt_man_chrome` | mã 0, «202 khang dinh, 0 hong» |

Ba eval đỏ làm mọi lượt ghim lại của hai hồ sơ đỏ: lượt ghim chạy mọi eval máy và từ chối ghi pin
khi một eval khác 0.

## Nguyên nhân

- **E23, E25** lấy phạm vi «vòng này» bằng `origin/onehub...HEAD` và `merge-base HEAD origin/onehub`.
  Trên nhánh mở, đó là đúng phần của vòng. Sau khi PR #162 gộp (`f2acca7f1`), cả hai trỏ vào tập
  rỗng, nên thước thoát 2 trên mọi cây chứa vòng — thước tự hết hạn.
- **E5** đọc `evals.yaml` của mọi hồ sơ đã ký bằng `Bun.YAML.parse`. Bộ đọc này từ chối bốn tệp mà
  bộ đọc của kit (`lib/eval-yaml.cjs`, cùng hàm lượt ghim và lưới trước gộp dùng) đọc được:
  `dieu-phoi-hai-tang`, `lich-su-va-luu-tru-trang`, `no-sau-luot-5-okr`, `zalo-gui-hong-ghi-ly-do`.
  E5 cũng neo «vòng này» bằng `merge-base(HEAD, origin/onehub)` — mục Ngoài-1 của hồ sơ, chủ kho
  chọn «mở hợp đồng mới» ở Cổng Bằng chứng 25/09.
- **Ngoài-3 của lam-moi**: bộ ghi `invalidateQueries` trong `apps/app/test/lam-moi-chuyen-viec.dom.tsx`
  chỉ ghi lời gọi có `queryKey`; lời gọi không khoá (làm mới tất cả) lọt qua, nên «0 lời gọi» của E3
  đo trên một công cụ đã lọc. Chủ kho chọn «mở hợp đồng mới» cùng ngày.
- **E7 cap-nhat-tuan-okr** xanh ở mốc nền (sửa ở PR #273). Không chạm.

## Cách sửa

Luật đã ký: `_acceptance/thuoc-khong-tu-het-han/contract.md` AC-3 — thước «vòng này» neo cặp sha gộp
`<merge>^1..<merge>`; chạy ở hai ref khác nhau cho đầu ra giống hệt.

1. **soi-ma.mjs (E23)**: mốc so sánh là cặp gộp của PR #162 — gốc `f2acca7f1^1`, đỉnh `f2acca7f1`. Tập
   tệp đổi lấy từ `git diff gốc...đỉnh`; nội dung tệp và tệp cấu hình số đọc ở đỉnh (`git show`), không
   đọc cây làm việc, để PR sau không đổi được kết quả. Ca tự kiểm sẵn có của script giữ nguyên.
2. **migration-chi-them.mjs (E25)**: cùng cặp gộp; thư mục migration mới là thư mục có ở đỉnh mà không có
   ở gốc; nội dung SQL đọc ở đỉnh.
3. **khong-hoi-quy.mjs (E5)**: đọc `evals.yaml` bằng bộ đọc của kit, giải qua `scripts/resolve-plugin.mjs`
   như các răng khác của kho. «Vòng này» neo cặp gộp PR #145 — gốc `100847e8a^1`, đỉnh `100847e8a`. Ref
   không giải được thì in «KHONG DO DUOC» mã 2, không ném (gỡ luôn Ngoài-2).
4. **Bộ ghi của lam-moi-chuyen-viec.dom.tsx (Ngoài-3)**: ghi mọi lời gọi `invalidateQueries`, lời gọi
   không khoá ghi thành dấu `(khong khoa)`; E3 đếm trên bộ ghi đủ.
5. **Câu `expected`** của E23, E25, E5 (và E3 nếu câu chữ nói về bộ ghi) sửa cho khớp mốc mới; tên eval,
   `criterion`, thông điệp ghim giữ nguyên.
6. **Ghim lại** hai hồ sơ đã sửa ở đỉnh nhánh trước khi gộp.

## Đo của vòng này

Răng riêng ở `_acceptance/neo-thuoc-het-han/rang/`:
- chạy ba lệnh đã sửa ở HEAD: mã 0 và in dòng mốc cặp gộp;
- chạy E23, E25 ở một cây tạm dựng từ HEAD cộng một commit giả chạm tệp okr giao diện và thêm một thư mục
  migration: đầu ra giống hệt HEAD (neo không trôi theo cây);
- chiều đỏ: bản sao từng răng trả lại mốc trôi hoặc `Bun.YAML` thì đỏ với đúng thông điệp ghim cũ; bản sao
  hộp chuyển việc chèn `invalidateQueries()` không khoá vào nhánh lỗi thì E3 đỏ «khong lam moi khi loi»;
- phạm vi: vòng chỉ chạm danh sách tệp đã xin (yêu cầu P7-24), mọi eval khác của hai hồ sơ giống hệt;
- ghim xanh: hai hồ sơ có lượt ghim mới xanh, không cũ hơn lần sửa.

## Không làm

- Không sửa E7 cap-nhat-tuan-okr (xanh ở mốc nền).
- Không quét toàn kho tìm thước trôi khác — việc đó là `thuoc-khong-tu-het-han` và các hàng vệ sinh khác.
- Không đổi bộ đọc YAML của kit hay của `Bun`; không sửa bốn `evals.yaml` mà `Bun.YAML` từ chối.
- Không sửa ca `app-rieng` của agent-okr đỏ sẵn ở đường nền (r2·P0 đang làm `tran-cho-app-rieng`).
