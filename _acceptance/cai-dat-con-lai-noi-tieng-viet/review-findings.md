# Review findings — cai-dat-con-lai-noi-tieng-viet

Luot soi ma cua vong chay 05/09. Phan loai pham vi chay binh thuong: **khong phat hien nao
nam TRONG hop dong**. Muoi mot phat hien deu NGOAI hop dong va di thang sang cong ky.

## Ngoài hợp đồng

### Cookie-lifetime labels: `as keyof` cast plus a silent fallback to the English server label

- de xuat: known-limits
- file: `apps/app/app/(app)/[slug]/settings/tracking/tracking-cookies.tsx:112`
- muc: medium
- vi sao ngoai hop dong: Ca ba muc han cookie hien khop bang dich nen AC-1 van dat; day la rui ro robustness khi danh sach phia may chu doi trong tuong lai, khong phai mot AC dang that bai hom nay.
- tieng san pham: Neu sau nay co them hoac doi mot muc thoi han luu cookie, o chon co the hien tieng Anh giua mot man cai dat tieng Viet ma khong co canh bao nao.

### `cn()` called on a single static class string

- de xuat: wont-fix
- file: `apps/app/app/(app)/[slug]/settings/tracking/allowed-domains.tsx:48`
- muc: low
- vi sao ngoai hop dong: Khong AC nao cua hop dong lien quan toi cach goi ham tien ich CSS; day thuan la gon-ma, ngoai pham vi dich thuat cua hop dong.
- tieng san pham: Day chi la mot cho viet du trong ma, khong anh huong gi toi nguoi dung.

### Member role enum and its display order now derive from the translation catalog

- de xuat: known-limits
- file: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx:33`
- muc: low
- vi sao ngoai hop dong: Hop dong khong co AC nao kiem nguon hoac thu tu cua enum vai tro; day la rui ro kien truc theo AGENTS.md, khong phai mot tieu chi dich thuat dang that bai.
- tieng san pham: Neu ban dich tieng Viet bi sap xep lai thu tu trong tuong lai, menu chon vai tro thanh vien co the tu doi thu tu theo, khien nguoi dung de chon nham vai tro.

### New message modules drop the locale fallback the shared catalog has

- de xuat: known-limits
- file: `apps/app/lib/messages/settings-ket-noi.ts:575`
- muc: low
- vi sao ngoai hop dong: Khong AC nao yeu cau cac ham lay kho chuoi phai co gia tri fallback; resolveLocale hien da dam bao locale hop le nen khong AC nao dang that bai.
- tieng san pham: Neu mot loi vao moi trong tuong lai goi toi cac man cai dat vua them ma khong qua buoc kiem ngon ngu hien co, man co the bao loi trang thay vi hien ngon ngu mac dinh.

### Guard đọc nhầm file: gộp cả thư mục kho chuỗi rồi lấy khối `nhom` cuối cùng

- de xuat: known-limits
- file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs:391`
- muc: high
- vi sao ngoai hop dong: Ban khai khong-du-quyen.json hien chi co ten nhom duy nhat nen phep do AC-4 van doc dung khoi hom nay; day la rui ro tiem an cua cong cu do, khong phai mot AC dang do.
- tieng san pham: Cong cu do tu dong co the doc nham bang chuoi khi hai khu vuc cai dat khac nhau dung trung ten nhom, khien ket qua dat/khong dat trong cac vong do sau nay khong con dang tin du man hinh that co loi.

### Hạn cookie: `?? lifetime.label` lặng lẽ rơi về nhãn tiếng Anh của API

- de xuat: known-limits
- file: `apps/app/app/(app)/[slug]/settings/tracking/tracking-cookies.tsx:113`
- muc: medium
- vi sao ngoai hop dong: Cung mot van de voi muc cookie o dong 112 — hien chua gay nhan tieng Anh nao tren man nen khong AC nao dang that bai hom nay.
- tieng san pham: Cung mot rui ro voi muc han cookie o tren: mot muc han moi trong tuong lai co the hien nhan tieng Anh giua man tieng Viet ma khong canh bao.

### `export KHOA_CAY_CHU=$` thiếu một dấu `$` — không phải PID

- de xuat: known-limits
- file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/be-rong-do-lib.sh:15`
- muc: low
- vi sao ngoai hop dong: Bien nay chi duoc dung nhu mot co co/khong trong ma hien tai nen khong gay sai lech cho chan dot bien nao cua hop dong hom nay.
- tieng san pham: Day la loi nho trong cong cu do noi bo, hien khong gay hau qua gi cho nguoi dung vi gia tri chi duoc dung nhu mot co co/khong.

### Guard chuỗi lấy hàm export đầu tiên tìm thấy, không lấy theo tên

- de xuat: known-limits
- file: `apps/app/test/messages-guard.spec.ts:25`
- muc: low
- vi sao ngoai hop dong: Khong AC nao cua hop dong chi dinh cach messages-guard.spec.ts phai chon ham; day la guard rieng cua kho, ngoai cac thuoc rang/ ma hop dong dat ten.
- tieng san pham: Cong cu kiem chuoi dich co the am tham kiem nham mot ham phu thay vi ham chinh khi co nguoi them ham moi, khien viec kiem tra bo sot loi ma khong ai hay.

### Danh mục kết nối lọc theo chuỗi hiển thị đã dịch

- de xuat: known-limits
- file: `apps/app/app/(app)/[slug]/settings/connections/add-connection-dialog.tsx:45`
- muc: low
- vi sao ngoai hop dong: Hom nay bang ten giu nguyen tieng Anh o ca hai locale va locale may chu/trinh duyet trung nhau nen khong AC nao dang that bai; day la rui ro tuong lai.
- tieng san pham: Neu sau nay co nguoi dich ten Microsoft 365 sang tieng Viet, hop thoai them ket noi co the lai hien dich vu da cam nhu the chua cam, gay nham lan cho nguoi quan tri.

### Hình dạng 5 — tuyên quét LỚP «dữ liệu người nhập» nhưng chỉ có sáu điểm-case kê tay, và chân sinh-ứng-viên tự miễn trừ đúng lớp đó

- de xuat: known-limits
- file: `_acceptance/cai-dat-con-lai-noi-tieng-viet/rang/man-that.mjs:307`
- muc: high
- vi sao ngoai hop dong: Ca AC-6 (thuong hieu/URL) va AC-6b (bang dong du lieu nguoi nhap) deu tu gioi han pham vi theo thiet ke cua minh; khoang trong neu ra la ve do day du cua bo thuoc, khong quy duoc ve mot AC cu the dang that bai voi do chac chan cao.
- tieng san pham: Mot so du lieu nguoi dung tu nhap, nhu ten mien hay ten thanh vien, tren cac man cai dat co the chua duoc kiem day du de chac chan trinh duyet khong tu dich chung.

### Hình dạng 3 — mũi gọi khai-sinh chỉ assert «chuỗi XANH có mặt» trong khi lời hứa là các con số đã ký tái lập được

- de xuat: wont-fix
- file: `_acceptance/cai-dat-con-lai-noi-tieng-viet/rang/mot-bo-thuoc.mjs:50`
- muc: low
- vi sao ngoai hop dong: Ba mui goi con lai da ghim dung ba con so hop dong doi, va thoat ma da duoc kiem rieng; mui goi thu tu khong them khang dinh nao nen AC-13 ve (2) van duoc thoa.
- tieng san pham: Mot trong bon phep kiem khong thuc su doc so lieu de so sanh, nhung cac so lieu do van duoc ba phep kiem khac xac nhan dung nen khong co hau qua thuc te cho nguoi dung.

