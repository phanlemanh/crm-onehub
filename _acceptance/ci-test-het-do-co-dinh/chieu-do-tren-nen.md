# Chiều đỏ trên nền onehub 6ca59691a (trước khi sửa), đo 31/10 ở phiên dãy K

## api — 278 tệp theo thứ tự lượt CI 41191965481, kho crm_f37thutu_test
 2167 pass
 3 fail
(fail) (unnamed) [16.07ms]
(fail) dgt-thuoc > dgt-thuoc: đúng đáp án viết tay trên kho mẫu, chỉ đọc, gieo luỹ đẳng [159.14ms]
(fail) vai-chi-okr > gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha [214.58ms]
Foreign key constraint violated on the constraint: `viec_nguoiGiaoId_fkey`
Foreign key constraint violated on the constraint: `viec_nguoiGiaoId_fkey` [user.deleteMany]
Ran 2188 tests across 278 files. [377.04s]

## api — cùng thứ tự sau khi sửa, kho crm_f37thutu2_test
 2169 pass
 0 fail
Ran 2187 tests across 278 files. [396.72s]

## app-ui — lai-ra-man.spec.tsx chạy trước pre-push-da-chung.spec.ts, -t dau-hook, bản cũ
Lệnh (từ packages/ui): `bun test --preload ./test/setup-dom.ts ./test/lai-ra-man.spec.tsx ./test/pre-push-da-chung.spec.ts -t dau-hook`
Bản sửa (168633d2a trở đi): 10 pass · 0 fail.
(fail) dau-hook > dau-hook (e): chuoi ngay 13 roi 15 [1492.26ms]
- Expected  - 1
+ Received  + 5
 8 pass
 1 fail

## Kho thử crm_f37thutu_test sau lượt đỏ
member owner duy nhất: dev-66333774687574752d67 · f37thutu-grant-needed@localhost (dev-grant-needed.spec.ts, vị trí 62)
viec chặn: cmvwdv3zz0nulbttyj65al8gv «Đọc lại ghi chú buổi gặp quý trước» nguoiGiaoId=dev-66333774687574752d67 (gieoViecMau)
