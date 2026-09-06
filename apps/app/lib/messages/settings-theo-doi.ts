import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		tab: "Tracking & Analytics",
		tieuDe: "Tracking & Analytics",
		moTa: "Track website visitors and automatically add contacts when a form is submitted.",
	},
	doanMa: {
		tieuDe: "Tracking script",
		moTa: "One tag, 4 KB, in the head of every page you measure.",
		trangThai: {
			tamDung: "Paused",
			dangNhan: "Receiving page views",
			chuaNhan: "No page views yet",
		},
		chep: "Copy",
		daChep: "Script copied.",
		khongChep: "Could not copy the script.",
		khongChepBoiDen: "Could not copy the script. Select it instead.",
		daTamDung:
			"Tracking paused. The script stops recording within five minutes.",
		daChayLai: "Tracking resumed.",
		daDoiSiteId: "Site ID rotated. Paste the new tag on your website.",
		danHtml: "Paste it into your HTML",
		siteIdNhan: "Site ID",
		siteIdMoTa: "· Rotating it stops every copy of the old script at once.",
		themQuaGtm: "Add it through Google Tag Manager",
		buoc1: "In Tag Manager, add a new Custom HTML tag.",
		buoc2: "Paste this snippet — not the one above — as the tag's HTML.",
		buoc3Dau: "Trigger it on All Pages, then publish the container. Keep",
		buoc3Cuoi: "off any consent-blocked category you do not need.",
		ghiChuDau: "Tag Manager drops a",
		ghiChuCuoi:
			"attribute when it injects a script, so this form carries the site ID in the URL instead.",
		tamDungNhan: "Pause tracking",
		tamDungMoTa:
			"The script keeps loading and records nothing. Your domains and settings are kept",
		doiSiteId: "Rotate site ID",
		hoiDoi: "Rotate the site ID?",
		hoiDoiMoTa:
			"Every copy of the old script stops recording at once, including any you have forgotten about. You will need to paste the new tag on every page that carries the old one. Nothing already collected is lost.",
		huy: "Cancel",
		doi: "Rotate",
	},
	kiemTra: {
		tieuDe: "Verify installation",
		moTa: "We load one page and look for the script, then read your Tag Manager container if it is not in the HTML.",
		kiemNgay: "Check now",
		trangNhan: "Page to check",
		trangGoiY: "acme.com/pricing",
		trangMoTa:
			"The page has to be public. A page behind a login always fails this check.",
		trangThai: {
			vuaXong: "Verified just now",
			gtmCanSua: "Tag Manager needs a fix",
			chuaCoLuotXem: "No page view yet",
			khongThay: "Not detected",
		},
		khongMo: "Could not open",
		khongMoMoTa:
			"We only follow public pages, and we never follow a redirect to a private address.",
		khongCoScript: "No script on",
		khongCoScriptMoTa: (ms: string) =>
			`The page answered in ${ms} ms, but the tag was not in the HTML. Check that it sits in the head, above anything that rewrites the page.`,
		cungDocContainer: (ten: string) =>
			` We also read Tag Manager container ${ten}, and the tag is not in there either.`,
		noiVa: " and ",
		gtmRoiSiteId: "Tag Manager will drop the site ID",
		gtmRoiSiteIdMoTa: (id: string) =>
			`Container ${id} carries the tag, but the site ID is not in the script URL. Tag Manager keeps only the URL when it injects a script, so a data-site attribute never reaches the page and the tracker never starts. Copy the Tag Manager snippet above and replace the tag's HTML.`,
		vanCoLuotXem:
			" A page view did arrive in the last five minutes, so something on this site is still recording.",
		thayTrongContainer: "Script found in container",
		thayTren: "Script found on",
		thayMoTaDau: (ms: string) => `It answered in ${ms} ms. Site ID`,
		thayMoTaGiua: "matched, and this domain is",
		coTrongDanhSach: "on the allow list.",
		khongTrongDanhSach: "not on the allow list.",
		chiChayKhiGtm:
			" The tag is not in the HTML, so it only runs once Tag Manager fires it — a page view is the proof.",
		coLuotXem: " A page view arrived in the last five minutes.",
		chuaCoLuotXem:
			" No page view has arrived yet — open the page in a browser to send one.",
	},
	tenMien: {
		tieuDe: "Allowed domains",
		moTa: "The script records page views on these hosts only.",
		trong: "Add the domain your website runs on to get your tracking script.",
		cot: {
			ten: "Domain",
			phamVi: "Scope",
			luotXem: "Page views",
			lanCuoi: "Last seen",
			hanhDong: "Actions",
		},
		phamVi: {
			SITE_AND_SUBDOMAINS: "Site + subdomains",
			EXACT_HOST: "Exact host",
		},
		go: "Remove",
		daGo: "Domain removed.",
		them: "Add domain",
		daThem: "Domain added.",
		tenNhan: "Domain",
		tenGoiY: "acme.com",
		phamViNhan: "Scope",
	},
	nguon: {
		tieuDe: "Traffic sources",
		moTa: "Where your visitors come from. Only people who have submitted a form are attributed to a record.",
		trong:
			"No sources yet. They appear once the script records its first page view.",
		cot: {
			nguon: "Source",
			kenh: "Medium",
			luotXem: "Page views",
			caNhan: "Contacts",
		},
	},
	luat: {
		tieuDe: "Tracking rules",
		moTa: "Where the script may run, and how it follows a visitor.",
		co: {
			crossDomain: {
				nhan: "Automatic cross-domain linking",
				goiY: "Carry the visitor between the domains below, so one journey is not counted as two people",
			},
			limitToDomains: {
				nhan: "Limit tracking to the domains below",
				goiY: "On any other domain the script loads and then does nothing",
			},
		},
	},
	cookie: {
		hanTheoNgay: { "395": "13 months", "180": "6 months", "0": "Session only" },
		tieuDe: "Cookies",
		moTa: "How a returning visitor is recognised.",
		co: {
			cookieSubdomains: {
				nhan: "Limit cookies to subdomains",
				goiY: "Set the cookie on the exact host that served the page, never on the parent domain",
			},
			secureCookies: {
				nhan: "Use secure cookies only",
				goiY: "Send the cookie over HTTPS and drop it on plain HTTP",
			},
			honourDnt: {
				nhan: "Honour Do Not Track",
				goiY: "Record nothing at all when the browser asks not to be tracked",
			},
		},
		hanNhan: "Cookie lifetime",
		hanMoTa:
			"After this a returning visitor counts as somebody new. Shorten it if your policy asks you to.",
		daLuuHan: "Cookie lifetime saved.",
	},
};

export type TheoDoiMessages = typeof en;

const vi = {
	trang: {
		tab: "Theo dõi & phân tích",
		tieuDe: "Theo dõi & phân tích",
		moTa: "Theo dõi người vào website, và tự thêm cá nhân khi có biểu mẫu được gửi.",
	},
	doanMa: {
		tieuDe: "Đoạn mã theo dõi",
		moTa: "Một thẻ, 4 KB, đặt trong head của mọi trang bạn muốn đo.",
		trangThai: {
			tamDung: "Đang tạm dừng",
			dangNhan: "Đang nhận lượt xem",
			chuaNhan: "Chưa có lượt xem",
		},
		chep: "Chép",
		daChep: "Đã chép đoạn mã.",
		khongChep: "Không chép được đoạn mã.",
		khongChepBoiDen: "Không chép được đoạn mã. Bôi đen rồi chép tay.",
		daTamDung: "Đã tạm dừng theo dõi. Script ngừng ghi trong vòng năm phút.",
		daChayLai: "Đã theo dõi lại.",
		daDoiSiteId: "Đã đổi site ID. Dán thẻ mới lên website của bạn.",
		danHtml: "Dán thẳng vào HTML",
		siteIdNhan: "Site ID",
		siteIdMoTa: "· Đổi nó thì mọi bản script cũ ngừng ghi cùng lúc.",
		themQuaGtm: "Thêm qua Google Tag Manager",
		buoc1: "Trong Tag Manager, thêm một thẻ Custom HTML mới.",
		buoc2: "Dán đoạn mã này — không phải đoạn ở trên — làm phần HTML của thẻ.",
		buoc3Dau: "Đặt trigger All Pages, rồi xuất bản container. Giữ",
		buoc3Cuoi: "ngoài mọi nhóm bị chặn theo đồng ý mà bạn không cần.",
		ghiChuDau: "Tag Manager làm rơi thuộc tính",
		ghiChuCuoi:
			"khi nó chèn script, nên dạng này mang site ID trong URL để bù lại.",
		tamDungNhan: "Tạm dừng theo dõi",
		tamDungMoTa:
			"Script vẫn tải về nhưng không ghi gì. Tên miền và cài đặt của bạn vẫn được giữ",
		doiSiteId: "Đổi site ID",
		hoiDoi: "Đổi site ID?",
		hoiDoiMoTa:
			"Mọi bản script cũ ngừng ghi ngay lập tức, kể cả bản bạn đã quên mất. Bạn phải dán thẻ mới lên mọi trang còn mang thẻ cũ. Dữ liệu đã thu không mất gì.",
		huy: "Huỷ",
		doi: "Đổi",
	},
	kiemTra: {
		tieuDe: "Kiểm tra thẻ đã gắn",
		moTa: "Tải một trang rồi tìm script trong đó. Không thấy trong HTML thì đọc tiếp container Tag Manager của bạn.",
		kiemNgay: "Kiểm tra",
		trangNhan: "Trang cần kiểm",
		trangGoiY: "acme.com/pricing",
		trangMoTa:
			"Trang phải công khai. Trang nằm sau màn đăng nhập luôn trượt phép kiểm này.",
		trangThai: {
			vuaXong: "Vừa kiểm, có thẻ",
			gtmCanSua: "Tag Manager cần sửa",
			chuaCoLuotXem: "Chưa có lượt xem",
			khongThay: "Không thấy thẻ",
		},
		khongMo: "Không mở được",
		khongMoMoTa:
			"Chỉ mở trang công khai, và không bao giờ đi theo chuyển hướng tới địa chỉ nội bộ.",
		khongCoScript: "Không thấy script trên",
		khongCoScriptMoTa: (ms: string) =>
			`Trang trả lời trong ${ms} ms, nhưng thẻ không nằm trong HTML. Kiểm lại xem thẻ có nằm trong head, phía trên mọi thứ viết lại trang, hay không.`,
		cungDocContainer: (ten: string) =>
			` Đã đọc cả container Tag Manager ${ten}, và thẻ cũng không có trong đó.`,
		noiVa: " và ",
		gtmRoiSiteId: "Tag Manager sẽ làm rơi site ID",
		gtmRoiSiteIdMoTa: (id: string) =>
			`Container ${id} có mang thẻ, nhưng site ID không nằm trong URL của script. Tag Manager chỉ giữ lại URL khi chèn script, nên thuộc tính data-site không bao giờ tới được trang và bộ theo dõi không khởi động. Chép đoạn mã Tag Manager ở trên rồi thay phần HTML của thẻ.`,
		vanCoLuotXem:
			" Vẫn có một lượt xem tới trong năm phút qua, nên thứ gì đó trên site này còn đang ghi.",
		thayTrongContainer: "Thấy script trong container",
		thayTren: "Thấy script trên",
		thayMoTaDau: (ms: string) => `Trả lời trong ${ms} ms. Site ID`,
		thayMoTaGiua: "khớp, và tên miền này",
		coTrongDanhSach: "nằm trong danh sách cho phép.",
		khongTrongDanhSach: "không nằm trong danh sách cho phép.",
		chiChayKhiGtm:
			" Thẻ không nằm trong HTML, nên nó chỉ chạy khi Tag Manager kích hoạt — một lượt xem là bằng chứng.",
		coLuotXem: " Có một lượt xem tới trong năm phút qua.",
		chuaCoLuotXem:
			" Chưa có lượt xem nào tới — mở trang đó trên trình duyệt để gửi một lượt.",
	},
	tenMien: {
		tieuDe: "Tên miền cho phép",
		moTa: "Script chỉ ghi lượt xem trên các tên miền này.",
		trong: "Thêm tên miền website của bạn để nhận đoạn mã theo dõi.",
		cot: {
			ten: "Tên miền",
			phamVi: "Phạm vi",
			luotXem: "Lượt xem",
			lanCuoi: "Lần cuối",
			hanhDong: "Hành động",
		},
		phamVi: {
			SITE_AND_SUBDOMAINS: "Cả tên miền con",
			EXACT_HOST: "Chỉ tên miền này",
		},
		go: "Gỡ",
		daGo: "Đã gỡ tên miền.",
		them: "Thêm tên miền",
		daThem: "Đã thêm tên miền.",
		tenNhan: "Tên miền",
		tenGoiY: "acme.com",
		phamViNhan: "Phạm vi",
	},
	nguon: {
		tieuDe: "Nguồn truy cập",
		moTa: "Người vào website đến từ đâu. Chỉ người đã gửi biểu mẫu mới gắn được vào một bản ghi.",
		trong:
			"Chưa có nguồn nào. Chúng hiện ra khi script ghi được lượt xem đầu tiên.",
		cot: {
			nguon: "Nguồn",
			kenh: "Kênh",
			luotXem: "Lượt xem",
			caNhan: "Cá nhân",
		},
	},
	luat: {
		tieuDe: "Luật theo dõi",
		moTa: "Script được chạy ở đâu, và nó theo chân người vào website thế nào.",
		co: {
			crossDomain: {
				nhan: "Tự nối các tên miền với nhau",
				goiY: "Mang người vào website đi giữa các tên miền dưới đây, để một hành trình không bị đếm thành hai người",
			},
			limitToDomains: {
				nhan: "Chỉ theo dõi trên các tên miền dưới đây",
				goiY: "Ở tên miền khác, script vẫn tải về rồi không làm gì",
			},
		},
	},
	cookie: {
		hanTheoNgay: {
			"395": "13 tháng",
			"180": "6 tháng",
			"0": "Chỉ trong phiên",
		},
		tieuDe: "Cookie",
		moTa: "Cách nhận ra một người quay lại.",
		co: {
			cookieSubdomains: {
				nhan: "Giới hạn cookie theo tên miền con",
				goiY: "Đặt cookie đúng trên tên miền đã trả trang, không bao giờ đặt lên tên miền cha",
			},
			secureCookies: {
				nhan: "Chỉ dùng cookie an toàn",
				goiY: "Gửi cookie qua HTTPS và bỏ nó trên HTTP thường",
			},
			honourDnt: {
				nhan: "Tôn trọng Do Not Track",
				goiY: "Không ghi gì cả khi trình duyệt xin đừng theo dõi",
			},
		},
		hanNhan: "Hạn cookie",
		hanMoTa:
			"Quá hạn này thì người quay lại được tính là một người mới. Rút ngắn nếu chính sách của bạn đòi thế.",
		daLuuHan: "Đã lưu hạn cookie.",
	},
} satisfies TheoDoiMessages;

const BANG = { en, vi } satisfies Record<Locale, TheoDoiMessages>;

export function theoDoiMessages(locale: Locale): TheoDoiMessages {
	return BANG[locale];
}
