# Model theo vai

Bảng kiến nghị model cho từng vai AI của CRM, dựng bởi `_acceptance/model-theo-vai-do-lai/rang/so-do.ts --ghi` từ các lượt đo của hàng MH4. Không sửa tay: sửa bằng chứng rồi dựng lại. Ngưỡng: `_acceptance/model-theo-vai-do-lai/rang/nguong.json`. Cỡ mẫu: `_acceptance/model-theo-vai-do-lai/evidence/ke-hoach.json`. Model chạy thật chưa đổi — đổi mặc định là hàng MH2.

| Vai | Đang chạy | Ứng viên | Kiến nghị | Vì sao | USD mỗi lượt | Ngày đo | Ngày mốc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tác nhân | `zai/glm-5.2-fast` | `zai/glm-5.3-flash` | zai/glm-5.3-flash (flash-low) | flash-low qua 5/5 lượt; ngưỡng 4/5 | 0.0082 | 2026-10-20 | 2026-10-16 |
| Trợ lý kho | `zai/glm-5.2-fast` | `zai/glm-5.3-flash` | giữ zai/glm-5.2-fast | tầng mot.S6-ngoai đúng 2, mốc 4 | 2.7498 | 2026-10-20 | 2026-10-13 |
| Soạn OKR | `google/gemini-3.8-flash` | `zai/glm-5.3-flash` | giữ google/gemini-3.8-flash | một lượt không nộp được đề xuất nào (đạt 8/18) — lượt hỏng | 0.1266 | 2026-10-20 | 2026-10-20 |
| Judge OKR | `zai/glm-5.2-fast` | — | giữ zai/glm-5.2-fast | Hỏi-3: không đổi judge ở vòng này, mọi số soạn OKR chấm bằng judge hiện tại | — | 2026-10-20 | 2026-10-20 |
| Máy soạn kho | `zai/glm-5.2-fast` | — | giữ zai/glm-5.2-fast | Hỏi-4: chưa có thước | — | — | — |

## Tác nhân

| Số | Giá trị | Tệp |
| --- | --- | --- |
| flash: lượt qua dưới 180 giây | 5/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| flash: trung vị giây phiên con | 28.7 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| flash-low: lượt qua dưới 180 giây | 5/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| flash-low: trung vị giây phiên con | 22.1 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| moc zai/glm-5.2-fast: lượt qua | 3/3 | `_acceptance/tac-nhan-glm-5-3-cham/evidence/tac-nhan.jsonl` |

Thông số chưa dò: trần bước phiên con; trần thời gian phiên con.

## Trợ lý kho

| Số | Giá trị | Tệp |
| --- | --- | --- |
| lượt 1 mot.S1 đúng | 13 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 mot.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 mot.S3 đúng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 mot.S6-gan đúng | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 mot.S6-ngoai đúng | 2 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 mot.S7 đúng | 8 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S1 đúng | 14 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S3 đúng | 6 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S6-gan đúng | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.S7 đúng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 hai.ngoai-kho đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| lượt 1 câu lỗi | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| mốc mot.S1 đúng | 14 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc mot.S2 đúng | 5 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc mot.S3 đúng | 7 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc mot.S6-gan đúng | 4 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc mot.S6-ngoai đúng | 4 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc mot.S7 đúng | 10 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S1 đúng | 15 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S2 đúng | 5 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S3 đúng | 8 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S6-gan đúng | 4 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S6-ngoai đúng | 4 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.S7 đúng | 10 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc hai.ngoai-kho đúng | 4 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |
| mốc câu lỗi | 2 | `_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md` |

Thông số chưa dò: flash-low cho Trợ lý kho.

- vòng hai qua Zalo: agent gốc chạy model mặc định zai/glm-5.2-fast, chỉ trợ lý kho đổi model
- USD ước theo số dư Gateway trước và sau lượt: gồm cả agent gốc của vòng Zalo và lời gọi khác cùng nhóm khoá trong khoảng đó, nên là ước cao

## Soạn OKR

| Số | Giá trị | Tệp |
| --- | --- | --- |
| lượt 1 đạt | 12/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| lượt 1 hỏng | 6 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| lượt 1 p90 ms | 62009 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| lượt 2 đạt | 8/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| lượt 2 hỏng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| lượt 2 p90 ms | 125940 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| mốc đạt | 13/18 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc hỏng | 3 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc p90 ms | 34066 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |

Thông số chưa dò: flash-low cho Soạn OKR.

- USD của eval soạn chưa gồm judge

## Judge OKR

| Số | Giá trị | Tệp |
| --- | --- | --- |
| lượt 1 judge hỏng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| lượt 1 judge dưới ngưỡng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| lượt 2 judge hỏng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| lượt 2 judge dưới ngưỡng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| mốc judge hỏng | 2 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc judge dưới ngưỡng | 3 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |

Thông số chưa dò: zai/glm-5.3-flash làm judge.

## Máy soạn kho

Thông số chưa dò: mọi thông số — chưa có thước.

- chưa có thước
