# Phá-thử — hoan-thien-hoi-crm-qua-zalo

Mỗi lượt phá một chỗ trên cây đã commit, chạy lệnh eval, hoàn lại bằng `git checkout`. Chép nguyên văn dòng đỏ.

## Việc 1 (E1, E2, E3) — cây bfde6e64

```
== bo chan set_field_value (exit 1)
error: set_field_value tu choi tren Zalo
(fail) chan-ghi > chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac [43.19ms]
error: phien con uy thac bi chan
(fail) chan-ghi > chan-ghi: phien con mang purpose zalo o initiator van bi chan [3.91ms]
error: expect(received).toThrow(expected)
(fail) ghi-that > ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web [21.33ms]
== chan khi khac research (exit 1)
error: archive_field khong tu choi o phien builder
(fail) chan-ghi > chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac [60.47ms]
== get_linkedin_profile sang doc (exit 1)
error: expect(received).toEqual(expected)
(fail) chan-ghi > chan-ghi: tap cong cu ghi dung 20 ten viet truoc [9.48ms]
== bo chan record_fact (exit 1)
error: record_fact tu choi tren Zalo
(fail) chan-ghi > chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac [38.99ms]
error: expect(received).toThrow(expected)
(fail) ghi-that > ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web [21.52ms]
== bo chan web_fetch (exit 1)
error: web_fetch tu choi tren Zalo
(fail) chan-ghi > chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac [45.47ms]
error: 
(fail) web-fetch > web-fetch: phien Zalo khong toi bo tai cua eve, phien web uy thac dung dau vao [13.98ms]
```

## Việc 2 (E4) — cây ed46f07e

```
== tra lai session.started (exit 1)
error: co step.started
(fail) chi-doc > chi-doc: bo giai chay o step.started, khong con session.started [0.22ms]
(fail) chi-doc > chi-doc: phien zalo nhan dung tap cong cu ghi, moi ban ghi de tu choi [0.19ms]
(fail) chi-doc > chi-doc: ban ghi de khong doi DB, cong cu that o phien khac van ghi [0.14ms]
== bo web_fetch khoi ghi (exit 1)
error: tep cong cu chua khai doc hay ghi: web_fetch
(fail) chi-doc > chi-doc: banh coc — moi tep cong cu thuoc dung mot danh sach [0.19ms]
```

## Việc 3 (E5) — cây f498ec29

```
== bo nhanh khong chu (exit 1)
error: sticker nhan chiDocChu
(fail) khong-chu > khong-chu: moi tin khong chu nhan chiDocChu, khong mo phien, khong them hang [37.54ms]
== loc event_name o webhook (exit 1)
error: sticker nhan chiDocChu
(fail) khong-chu > khong-chu: moi tin khong chu nhan chiDocChu, khong mo phien, khong them hang [16.23ms]
error: chua noi nhan huong dan
(fail) khong-chu > khong-chu: nguoi chua noi va duong luat cu giu nguyen [2.97ms]
```

## Việc 4 (E6) — cây f9c4c29a

```
== tra lai che cu (khong tach so tien) (exit 1)
error: 1.000.000.000.000 đ
Received: "Giá trị: 1.[đã ẩn] đ"
(fail) so-tien > so-tien: so tien lon giu nguyen [0.16ms]
== nhin lui cam chu so + dau phan cach (exit 1)
error: 0912345678,0987654321
Received: 1
(fail) so-tien > so-tien: so dien thoai lien sau so khac van bi che [0.16ms]
```

## Việc 5 (E7) — cây 33635ced

```
== nang tran ngay len 21 (exit 1)
error: tu-choi-tran-ngay 1
(fail) nguong > nguong: in dung muoi dong, nguoi mat quyen va gui hong tinh rieng [194.96ms]
```

## Việc 6 (E8) — cây 21707df5 / f3cacb25

```
== traLoiVe khong gui gi (exit 1)
error: da co tin gui di
(fail) cai-lenh > cai-lenh: tin cai lenh la cau hoi, khong ghi duoc, khong lo so, okr khong mo phien [43.67ms]
== tran phut 0 - cau muon khong mo (exit 1)
error: loai hoi
(fail) dang-ban > dang-ban: tra loi muon sau khi tick dong khong gui them, khong dong nham hang moi [19.43ms]
```

Lượt đầu của «tran phut 0» đỏ ở một expect chưa gắn nhãn đứng trước; đã dời khẳng định «loai hoi» lên ngay sau câu cũ (f3cacb25) rồi phá lại.

## Việc 7 (E9) — cây 37f13337

```
== canHoiLai dat bo:x (exit 1)
error: token bo dung hoiId
(fail) cung-phien > cung-phien: phien xin nhap them thi dong cau, bao mot cau, doi dia chi phien [14.94ms]
 6 pass
 1 fail
== doi dinh dang tokenPhien (phai van xanh o ca rut tu send) (exit 1)
error: token theo chat, nguoi, ngay
(fail) duong-chinh > duong-chinh: 200 truoc send, phien dung principal, tra loi ve dung nguoi, token theo phien [3041.86ms]
 6 pass
 1 fail
```

Lượt hai: chỉ khẳng định định dạng token (cố ý ghim ở AC-1 của hồ sơ cũ) đỏ; mọi sự kiện kênh rút từ send vẫn khớp — trước vòng này, token dựng tay `zalo:chat:ZA` không đi vòng qua lời gọi thật.

## Việc 8 (E10) — cây 1ba66e91

```
== datBuocXong done false (exit 1)
error: o (c) buoc da xong trong DB
(fail) luat-cu > luat-cu: nam o luat cu khong vao tac tu [104.55ms]
```

## Việc 9 (E11) — cây 12afde73

```
== repFromCrm bo cong vai (exit 1)
error: chi OKR o web
(fail) tu-choi-vai > tu-choi-vai: khung chat web va Zalo cho cung ket qua voi tung vai [19.93ms]
```

## S4 round 1 — sửa AC-2, AC-9 (cây 14f290d6)

```
== set_field_value web lang le khong ghi (exit 1)
error: web ghi duoc
(fail) ghi-that > ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web [57.30ms]
== record_fact web lang le khong ghi (exit 1)
error: web ghi duoc mot fact
(fail) ghi-that > ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web [56.94ms]
== token dung tay trong cung-phien (exit 1)
error: khong dung `zalo: dung tay
(fail) cung-phien > cung-phien: su kien kenh trong cung-phien va duong-chinh rut tu send [4.07ms]
```

## Sau dừng-vá — số quốc tế nhóm bằng dấu chấm (cây 7ba116e5)

```
== bo chan dau ma nuoc (exit 1)
error: Gọi +84 912.345.678 nhé
Received: 0
(fail) so-tien > so-tien: so dien thoai lien sau so khac van bi che [0.30ms]
```
