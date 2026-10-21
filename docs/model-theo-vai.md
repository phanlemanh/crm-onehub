# Model theo vai

Bảng kiến nghị model cho từng vai AI của CRM, dựng bởi `_acceptance/model-theo-vai-do-lai/rang/so-do.ts --ghi` từ các lượt đo của hàng MH4. Không sửa tay: sửa bằng chứng rồi dựng lại. Ngưỡng và luật chọn: `_acceptance/model-theo-vai-do-lai/rang/nguong.json`. Ứng viên, giá, cỡ mẫu, trần: `_acceptance/model-theo-vai-do-lai/evidence/ke-hoach.json`. Model chạy thật chưa đổi — đổi mặc định là hàng MH2.

Mỗi ứng viên đạt hay không theo ngưỡng của vai; ứng viên có lượt bị loại (sai model, lời dặn lệch mốc, dừng vì trần) hay thiếu kết xuất aiChiPhi là «chưa đủ số» và không vào luật chọn. Trong các ứng viên đạt, kiến nghị ứng viên có chi phí phần ứng viên mỗi lượt thấp nhất, bằng nhau thì điểm cao hơn rồi trung vị giây thấp hơn. Chi phí phần ứng viên = token vào × giá vào + token ra × giá ra trên các bước của vai trong kết xuất aiChiPhi của lượt, giá niêm yết ghim trong kế hoạch, không trừ đọc cache.

| Vai | Đang chạy | Ứng viên | Kiến nghị | Vì sao |
| --- | --- | --- | --- | --- |
| Tác nhân | `zai/glm-5.2-fast` | glm đạt, ds đạt | deepseek/deepseek-v4.1-flash-1017 (ds) | ds có chi phí phần ứng viên thấp nhất (0.008131155 USD mỗi lượt) trong 2 ứng viên đạt; ds qua 5/5 lượt dưới 180 giây; ngưỡng 4/5 |
| Trợ lý kho | `zai/glm-5.2-fast` | glm không đạt, ds đạt, gem không đạt | deepseek/deepseek-v4.1-flash-1017 | ds có chi phí phần ứng viên thấp nhất (0.188970375 USD mỗi lượt) trong 1 ứng viên đạt; mỗi tầng không kém mốc quá 1 câu, câu lỗi ≤ 2 |
| Soạn OKR | `google/gemini-3.8-flash` | glm không đạt, ds không đạt | giữ google/gemini-3.8-flash | không ứng viên nào đạt và đủ số — glm không đạt: một lượt không nộp được đề xuất nào (đạt 8/18) — lượt hỏng; ds không đạt: một lượt đạt 10/18, hỏng 7; ngưỡng ≥ 13/18, hỏng ≤ 3 |
| Judge OKR | `zai/glm-5.2-fast` | — | giữ zai/glm-5.2-fast | Hỏi-3: không đổi judge ở vòng này, mọi số soạn OKR chấm bằng judge hiện tại |
| Máy soạn kho | `zai/glm-5.2-fast` | — | giữ zai/glm-5.2-fast | Hỏi-4: chưa có thước |

## Tác nhân

Kiến nghị: deepseek/deepseek-v4.1-flash-1017 (ds). ds có chi phí phần ứng viên thấp nhất (0.008131155 USD mỗi lượt) trong 2 ứng viên đạt; ds qua 5/5 lượt dưới 180 giây; ngưỡng 4/5.

| Ứng viên | Model | Trạng thái | Chi phí phần ứng viên mỗi lượt (USD) | Chi phí thật mỗi lượt (USD) | Ngày đo | Vì sao |
| --- | --- | --- | --- | --- | --- | --- |
| glm (flash-low) | `zai/glm-5.3-flash` | đạt | 0.00897543 | 0.006961 | 2026-10-20 | flash-low qua 5/5 lượt dưới 180 giây; ngưỡng 4/5 |
| ds (ds) | `deepseek/deepseek-v4.1-flash-1017` | đạt | 0.008131155 | 0.016356 | 2026-10-20 | ds qua 5/5 lượt dưới 180 giây; ngưỡng 4/5 |

| Số | Giá trị | Tệp |
| --- | --- | --- |
| glm · flash: lượt qua dưới 180 giây | 5/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| glm · flash: trung vị giây phiên con | 28.7 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| glm · flash-low: lượt qua dưới 180 giây | 5/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| glm · flash-low: trung vị giây phiên con | 22.1 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| ds · ds: lượt qua dưới 180 giây | 5/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| ds · ds: trung vị giây phiên con | 39.9 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| ds · ds-low: lượt qua dưới 180 giây | 3/5 | `_acceptance/model-theo-vai-do-lai/evidence/tac-nhan.jsonl` |
| ds · ds-low: trung vị giây phiên con | 25.2 | `_acceptance/model-theo-vai-do-lai/evidence/bang-tac-nhan.md` |
| mốc zai/glm-5.2-fast: lượt qua | 3/3 | `_acceptance/tac-nhan-glm-5-3-cham/evidence/tac-nhan.jsonl` |

Kết xuất aiChiPhi của glm: `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-flash-low-1.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-flash-low-2.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-flash-low-3.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-flash-low-4.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-flash-low-5.json`.

Kết xuất aiChiPhi của ds: `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-ds-1.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-ds-2.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-ds-3.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-ds-4.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-ds-5.json`.

Thông số chưa dò: trần bước phiên con; trần thời gian phiên con; Gemini cho Tác nhân.

- mỗi ứng viên đại diện bằng biến thể qua nhiều lượt nhất, bằng nhau thì trung vị giây phiên con thấp hơn; chi phí của ứng viên là của biến thể đại diện

## Trợ lý kho

Kiến nghị: deepseek/deepseek-v4.1-flash-1017. ds có chi phí phần ứng viên thấp nhất (0.188970375 USD mỗi lượt) trong 1 ứng viên đạt; mỗi tầng không kém mốc quá 1 câu, câu lỗi ≤ 2.

| Ứng viên | Model | Trạng thái | Chi phí phần ứng viên mỗi lượt (USD) | Chi phí thật mỗi lượt (USD) | Ngày đo | Vì sao |
| --- | --- | --- | --- | --- | --- | --- |
| glm | `zai/glm-5.3-flash` | không đạt | — | 2.749777 | 2026-10-20 | tầng mot.S6-ngoai đúng 2, mốc 4 |
| ds | `deepseek/deepseek-v4.1-flash-1017` | đạt | 0.188970375 | 0.341442 | 2026-10-21 | mỗi tầng không kém mốc quá 1 câu, câu lỗi ≤ 2 |
| gem | `google/gemini-3.8-flash` | không đạt | 1.98789075 | 1.867994 | 2026-10-21 | 3 câu lỗi, trần 2 |

| Số | Giá trị | Tệp |
| --- | --- | --- |
| glm · lượt 1 mot.S1 đúng | 13 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 mot.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 mot.S3 đúng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 mot.S6-gan đúng | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 mot.S6-ngoai đúng | 2 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 mot.S7 đúng | 8 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S1 đúng | 14 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S3 đúng | 6 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S6-gan đúng | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.S7 đúng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 hai.ngoai-kho đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| glm · lượt 1 câu lỗi | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S1 đúng | 15 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S3 đúng | 8 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S6-gan đúng | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 mot.S7 đúng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S1 đúng | 15 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S2 đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S3 đúng | 8 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S6-gan đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.S7 đúng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 hai.ngoai-kho đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| ds · lượt 1 câu lỗi | 1 | `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S1 đúng | 15 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S3 đúng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S6-gan đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 mot.S7 đúng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S1 đúng | 15 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S2 đúng | 5 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S3 đúng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S6-gan đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S6-ngoai đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.S7 đúng | 9 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 hai.ngoai-kho đúng | 4 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
| gem · lượt 1 câu lỗi | 3 | `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/do-bo-mau.md` |
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

Kết xuất aiChiPhi của ds: `_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1/aichiphi.json`.

Kết xuất aiChiPhi của gem: `_acceptance/model-theo-vai-do-lai/evidence/kho/gem/luot-1/aichiphi.json`.

Thông số chưa dò: suy luận low cho Trợ lý kho.

- vòng hai qua Zalo: agent gốc chạy model mặc định zai/glm-5.2-fast, chỉ trợ lý kho đổi model
- chi phí thật của lượt kho: tổng costUsd của kết xuất aiChiPhi khi mọi bước có costUsd; chênh số dư Gateway chỉ để đối chiếu; lượt glm 20/10 chỉ có chênh số dư

## Soạn OKR

Kiến nghị: giữ google/gemini-3.8-flash. không ứng viên nào đạt và đủ số — glm không đạt: một lượt không nộp được đề xuất nào (đạt 8/18) — lượt hỏng; ds không đạt: một lượt đạt 10/18, hỏng 7; ngưỡng ≥ 13/18, hỏng ≤ 3.

| Ứng viên | Model | Trạng thái | Chi phí phần ứng viên mỗi lượt (USD) | Chi phí thật mỗi lượt (USD) | Ngày đo | Vì sao |
| --- | --- | --- | --- | --- | --- | --- |
| glm | `zai/glm-5.3-flash` | không đạt | — | 0.126621 | 2026-10-20 | một lượt không nộp được đề xuất nào (đạt 8/18) — lượt hỏng |
| ds | `deepseek/deepseek-v4.1-flash-1017` | không đạt | 0.0787815 | 0.10884 | 2026-10-21 | một lượt đạt 10/18, hỏng 7; ngưỡng ≥ 13/18, hỏng ≤ 3 |

| Số | Giá trị | Tệp |
| --- | --- | --- |
| glm · lượt 1 đạt | 12/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| glm · lượt 1 hỏng | 6 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| glm · lượt 1 p90 ms | 62009 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| glm · lượt 2 đạt | 8/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| glm · lượt 2 hỏng | 10 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| glm · lượt 2 p90 ms | 125940 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| ds · lượt 1 đạt | 10/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-1.json` |
| ds · lượt 1 hỏng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-1.json` |
| ds · lượt 1 p90 ms | 42516 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-1.json` |
| ds · lượt 2 đạt | 10/18 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-2.json` |
| ds · lượt 2 hỏng | 7 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-2.json` |
| ds · lượt 2 p90 ms | 45320 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-2.json` |
| mốc đạt | 13/18 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc hỏng | 3 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc p90 ms | 34066 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |

Kết xuất aiChiPhi của ds: `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-soan-ds-1.json`, `_acceptance/model-theo-vai-do-lai/evidence/aichiphi-soan-ds-2.json`.

Thông số chưa dò: suy luận low cho Soạn OKR.

- USD của eval soạn chưa gồm judge

## Judge OKR

Kiến nghị: giữ zai/glm-5.2-fast. Hỏi-3: không đổi judge ở vòng này, mọi số soạn OKR chấm bằng judge hiện tại.

| Số | Giá trị | Tệp |
| --- | --- | --- |
| flash-1 judge hỏng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| flash-1 judge dưới ngưỡng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-1.json` |
| flash-2 judge hỏng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| flash-2 judge dưới ngưỡng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-flash-2.json` |
| ds-1 judge hỏng | 1 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-1.json` |
| ds-1 judge dưới ngưỡng | 1 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-1.json` |
| ds-2 judge hỏng | 0 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-2.json` |
| ds-2 judge dưới ngưỡng | 1 | `_acceptance/model-theo-vai-do-lai/evidence/eval-soan-ds-2.json` |
| mốc judge hỏng | 2 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |
| mốc judge dưới ngưỡng | 3 | `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` |

Thông số chưa dò: zai/glm-5.3-flash làm judge; DeepSeek ở Judge OKR và Máy soạn kho.

## Máy soạn kho

Kiến nghị: giữ zai/glm-5.2-fast. Hỏi-4: chưa có thước.

Thông số chưa dò: mọi thông số — chưa có thước; DeepSeek ở Judge OKR và Máy soạn kho.

- chưa có thước
