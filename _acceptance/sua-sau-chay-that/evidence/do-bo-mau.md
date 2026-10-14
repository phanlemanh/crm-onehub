# Đo trợ lý kho trên bộ câu hỏi mẫu

bam bo-mau: 0b3f3f96ddddb749f0a1d78b43f4cdbe88af8648e6fae42722c9fb66b0e02ac2
bam tro-ly: 45f84eddef27a34724bb8e92d484955fe7484930022aeb918c5f114516d728b7
ma thoat cham-bo-do: 0
thu muc luot cham-bo-do: .acceptance-runs/tro-ly-doc-kho/cham-bo-do/2026-10-14T08-10-38-349Z-84303
luot 1: 46 ma
luot 2: 50 ma

## Tổng của script chấm

- dungTrang: 100.0% (38/38, nguong >= 80.0%) dat
- tuChoiDung: 100.0% (8/8, nguong >= 80.0%) dat
- chuyenQuyDinh: 100.0% (46/46, nguong >= 90.0%) dat
- chuyenNham: 0.0% (0/4, nguong <= 10.0%) dat
- tra loi co trich khong qua kiem: 0
- demHoiKho cua cua so chay: traLoi 76, tuChoi 16, loi 0, tiLe 82.6%

## Bảng

### Lượt một theo tầng — đạt là trả lời đúng trang hay từ chối đúng

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 15 | 15 | 100.0% | 0 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 8 | 8 | 100.0% | 0 |
| S6-gan | 4 | 4 | 100.0% | 0 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 10 | 10 | 100.0% | 0 |

### Lượt một theo kiểu chữ

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| chuan | 36 | 36 | 100.0% | 0 |
| khong-dau | 2 | 2 | 100.0% | 0 |
| sai-chinh-ta | 2 | 2 | 100.0% | 0 |
| tin-zalo | 2 | 2 | 100.0% | 0 |
| tron-anh | 2 | 2 | 100.0% | 0 |
| viet-tat | 2 | 2 | 100.0% | 0 |

### Lượt hai qua Zalo theo tầng — đạt là chuyển đúng cho trợ lý kho, ngoài kho thì không chuyển

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 15 | 15 | 100.0% | 0 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 8 | 8 | 100.0% | 0 |
| S6-gan | 4 | 4 | 100.0% | 0 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 10 | 10 | 100.0% | 0 |
| ngoai-kho | 4 | 4 | 100.0% | 0 |

### Không đạt

- (không có)

<!-- bang-do -->
```json
{
  "tang": {
    "S1": {
      "k": 15,
      "n": 15,
      "loi": 0
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 8,
      "n": 8,
      "loi": 0
    },
    "S6-gan": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S6-ngoai": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S7": {
      "k": 10,
      "n": 10,
      "loi": 0
    }
  },
  "kieuChu": {
    "chuan": {
      "k": 36,
      "n": 36,
      "loi": 0
    },
    "khong-dau": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "viet-tat": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "sai-chinh-ta": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "tron-anh": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "tin-zalo": {
      "k": 2,
      "n": 2,
      "loi": 0
    }
  },
  "zalo": {
    "S1": {
      "k": 15,
      "n": 15,
      "loi": 0
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 8,
      "n": 8,
      "loi": 0
    },
    "S6-gan": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S6-ngoai": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S7": {
      "k": 10,
      "n": 10,
      "loi": 0
    },
    "ngoai-kho": {
      "k": 4,
      "n": 4,
      "loi": 0
    }
  },
  "khongDat": []
}
```
<!-- /bang-do -->
