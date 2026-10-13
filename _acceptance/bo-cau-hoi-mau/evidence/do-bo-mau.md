# Đo trợ lý kho trên bộ câu hỏi mẫu

bam bo-mau: 0b3f3f96ddddb749f0a1d78b43f4cdbe88af8648e6fae42722c9fb66b0e02ac2
bam tro-ly: 891a790f17c0741c9d0e14f1ce8217b9f70f5b0f313caabfe6000b4a3592f77e
ma thoat cham-bo-do: 2
thu muc luot cham-bo-do: .acceptance-runs/tro-ly-doc-kho/cham-bo-do/2026-10-13T06-09-56-412Z-82027
luot 1: 46 ma
luot 2: 50 ma

## Tổng của script chấm

- KHONG DO DUOC: 2 cau loi (m09, m27)
- demHoiKho cua cua so chay: traLoi 73, tuChoi 17, loi 2, tiLe 81.1%

## Bảng

### Lượt một theo tầng — đạt là trả lời đúng trang hay từ chối đúng

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 14 | 14 | 100.0% | 1 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 7 | 7 | 100.0% | 1 |
| S6-gan | 4 | 4 | 100.0% | 0 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 10 | 10 | 100.0% | 0 |

### Lượt một theo kiểu chữ

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| chuan | 34 | 34 | 100.0% | 2 |
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

- m09 (luot 1: loi)
- m27 (luot 1: loi)

<!-- bang-do -->
```json
{
  "tang": {
    "S1": {
      "k": 14,
      "n": 14,
      "loi": 1
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 7,
      "n": 7,
      "loi": 1
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
      "k": 34,
      "n": 34,
      "loi": 2
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
  "khongDat": [
    "m09 (luot 1: loi)",
    "m27 (luot 1: loi)"
  ]
}
```
<!-- /bang-do -->
