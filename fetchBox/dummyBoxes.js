export const dummyBoxes = [
    // ==========================================
    // MAYIS 2026 - LOGLAR (Geçmiş)
    // ==========================================
    {
        id: "log_001", title: "Cenga Devir Teslim & Toplantı", category: "log",
        date: "2026-05-02T14:00:00Z", description: "Bahar dönemi etkinlik planlaması ve yönetim kurulu devir işlemleri.", tags: ["Community"], priority: "High",
        type: "Personal", isFavorite: true,
        
        hasLocation: true,
        location: { address: "Çukurova Üniversitesi Mühendislik Fakültesi, Amfi 2, Adana" },
        
        hasReminder: true,
        reminder: { date: "2026-05-02T12:00:00Z" },

        hasNote: true,
        note: {
            id: "note_log001",
            title: "Cenga 3. Yıl Değerlendirmesi ve Notlar",
            content: "Bugün Cenga (Bilgisayar Mühendisliği Topluluğu) kulüp odasında bahar dönemi etkinliklerini planladık ve 3 yıllık serüvenin devir teslim detaylarını konuştuk. Yeni üyelerle tanışma toplantısı için mühendislik fakültesindeki büyük amfinin ayarlanması gerekiyor. Ayrıca önümüzdeki ay yapılacak olan hackathon için sponsorluk dosyalarını güncelledik. Benim görevim teknik altyapıyı ve kayıt formlarını hazırlamak olacak. Toplulukta geçirdiğim 3 yıl boyunca edindiğim tecrübeleri CV'me detaylıca eklemem kariyerim açısından büyük bir artı sağlayacak.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_1", text: "Amfi tahsis dilekçesini bölüm sekreterliğine teslim et", isCompleted: true },
            { id: "todo_2", text: "Kayıt formu için detaylı bir Google Forms oluştur", isCompleted: true },
            { id: "todo_3", text: "Geçmiş etkinliklerin fotoğraflarını Drive'a yedekle", isCompleted: false },
            { id: "todo_4", text: "Yeni yönetim kuruluna yetki devri belgelerini imzalat", isCompleted: true },
            { id: "todo_5", text: "CV'ye Cenga sorumluluklarını madde madde ekle", isCompleted: true }
        ],
        hasMedia: true,
        media: {
            photos: ["/assets/fake_images/cenga_toplanti.jpg", "/assets/fake_images/amfi.jpg"],
            docs: [],
            audio: []
        }
    },
    {
        id: "log_002", title: "Bubble Shooter Collision Fix", category: "log",
        date: "2026-05-05T10:00:00Z", description: "Unity'de topların çarpışma mekaniklerinin düzeltilmesi.", tags: ["GameDev", "C#"], priority: "High",
        type: "Work", isFavorite: false,
        
        hasLocation: false,
        location: null,
        
        hasReminder: false,
        reminder: null,

        hasNote: true,
        note: {
            id: "note_log002",
            title: "Çarpışma (Collider) Algoritması Sorunu",
            content: "Bubble Shooter projemizde oyunun temel mekanikleriyle alakalı geliştirmeleri yaparken çok sinir bozucu bir bug ile karşılaştım. Toplar bazen yüksek hızlarda birbirinin içinden geçiyordu. Unity'nin standart OnCollisionEnter metodu yetersiz kalınca Raycast kullanarak topun gideceği yönü önceden hesapladım. Collider tetiklenmeden tam bir frame önce hedef noktayı matematiksel olarak tespit edip hız vektörünü sıfırladım. Çok zaman aldı ama mekanik şu an kusursuz çalışıyor. Bu projeyi de GitHub portföyüme gururla ekledim.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: true,
        media: {
            photos: ["/assets/fake_images/unity_bug.png", "/assets/fake_images/unity_fixed.png"],
            docs: [],
            audio: []
        }
    },
    {
        id: "log_003", title: "Appwrite & React Native Kurulumu", category: "log",
        date: "2026-05-07T16:00:00Z", description: "Uygulama için backend veritabanı bağlantısı.", tags: ["Backend", "Appwrite"], priority: "Medium",
        type: "Work", isFavorite: true,
        
        hasLocation: false,
        location: null,

        hasReminder: true,
        reminder: { date: "2026-05-07T15:30:00Z" },

        hasNote: false, note: null,
        hasTodos: true,
        todos: [
            { id: "todo_6", text: "Appwrite Cloud üzerinden yeni proje oluştur", isCompleted: true },
            { id: "todo_7", text: "React Native SDK kurulumu yap (npm install appwrite)", isCompleted: true },
            { id: "todo_8", text: "Database ID ve Collection ID'leri .env dosyasına ekle", isCompleted: true },
            { id: "todo_9", text: "Auth sağlayıcıları için Email/Password aktifleştir", isCompleted: false },
            { id: "todo_10", text: "İlk test dökümanını (dummy data) veritabanına pushla", isCompleted: false }
        ],
        hasMedia: true,
        media: {
            photos: [],
            docs: ["/assets/fake_docs/appwrite_setup_guide.pdf"],
            audio: []
        }
    },
    {
        id: "log_004", title: "New Jersey Tax Form - WAT", category: "log",
        date: "2026-05-08T09:15:00Z", description: "Work and Travel vergi iadesi için doküman derlenmesi.", tags: ["Finance", "WAT"], priority: "High",
        type: "Finance", isFavorite: false,
        
        hasLocation: true,
        location: { address: "123 Boardwalk, Ocean City, NJ 08226, USA" },

        hasReminder: true,
        reminder: { date: "2026-05-07T20:00:00Z" },

        hasNote: true,
        note: {
            id: "note_log004",
            title: "Vergi İadesi Detayları ve Property Tax Credit",
            content: "W-2 formumu eski işverenden sonunda alabildim. New Jersey eyaleti için state tax formunu doldururken Property Tax Credit kısımlarını son derece dikkatli okudum. Non-resident alien (göçmen olmayan yabancı) statüsünde olduğum için standart 1040 yerine kesinlikle 1040-NR formunu kullanmam şart. Eyalet vergi kuralları federal kurallardan biraz farklı işliyor. Formdaki tüm rakamları üç kez kontrol ettim, yanlış bir form gönderirsem IRS ile başım ciddi derde girebilir.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_11", text: "W-2 formunun dijital kopyasını al", isCompleted: true },
            { id: "todo_12", text: "1040-NR formunun PDF'ini indir ve doldur", isCompleted: true },
            { id: "todo_13", text: "NJ Property Tax Credit uygunluğunu doğrula", isCompleted: true },
            { id: "todo_14", text: "Belgeleri posta yoluyla veya onaylı e-filing ile gönder", isCompleted: false }
        ],
        hasMedia: true,
        media: {
            photos: ["/assets/fake_images/w2_form_scan.jpg"],
            docs: ["/assets/fake_docs/nj_tax_return.pdf"],
            audio: []
        }
    },
    {
        id: "log_005", title: "Airport DB Schema - Proje Teslimi", category: "log",
        date: "2026-05-12T10:00:00Z", description: "Aynur ve Sefa ile Havalimanı veritabanı tasarımı.", tags: ["SQL", "University"], priority: "High",
        type: "Education", isFavorite: true,
        
        hasLocation: true,
        location: { address: "Üniversite Kütüphanesi, 2. Kat Grup Çalışma Odası" },

        hasReminder: false,
        reminder: null,

        hasNote: true,
        note: {
            id: "note_log005",
            title: "Database Management System - Homework 4",
            content: "Grup arkadaşım Aynur Süalp ve Sefa Keskin ile birlikte havalimanı otomasyonu için airport_db şemasını başarılı bir şekilde ayağa kaldırdık. Yolcular, uçuşlar, bagaj kayıtları, biletler ve uçak tipleri arasında Foreign Key (Dış Anahtar) bağlantılarını SQL üzerinden kurduk. Özellikle biletleme ve rezervasyon tablosundaki çoka çok (many-to-many) ilişkiyi çözmek için bir ara bağlantı tablosu oluşturmamız gerekti. Sefa'nın yazdığı trigger'lar ve Aynur'un hazırladığı view'lar ile projeyi zenginleştirdik.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_15", text: "Entity-Relationship (ER) Diyagramını Visio'da çiz", isCompleted: true },
            { id: "todo_16", text: "Tüm tabloları 3. Normal Form'a (3NF) uygun hale getir", isCompleted: true },
            { id: "todo_17", text: "Karmaşık Join sorgularının testlerini yap", isCompleted: true },
            { id: "todo_18", text: "Proje raporunu formatlayıp sisteme yükle", isCompleted: true }
        ],
        hasMedia: true,
        media: {
            photos: [],
            docs: ["/assets/fake_docs/airport_schema.sql", "/assets/fake_docs/homework4_report.pdf"],
            audio: ["/assets/fake_audio/grup_toplantisi.mp3"]
        }
    },
    {
        id: "log_006", title: "Scheduling Algoritması Bug Fix", category: "log",
        date: "2026-05-16T11:00:00Z", description: "Görev sürelerini hesaplayan algoritmada mantık hatasının çözülmesi.", tags: ["Algorithm", "University"], priority: "Medium",
        type: "Education", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-05-16T10:00:00Z" },

        hasNote: true,
        note: {
            id: "note_log006",
            title: "Matematiksel Mantık Hatası",
            content: "Algoritmayı test ederken fark ettim ki task sürelerini yanlış sıraya ekliyormuşum. Bir tarafın yükü 18, diğer tarafın yükü 16 iken; yeni gelen 8 birimlik süreyi yanlışlıkla 18'in üzerine ekliyordum. Bunun yerine 8'i 16'ya eklemem gerekiyordu ki dengeleme (load balancing) düzgün çalışabilsin. Bu küçük if bloğu hatası tüm zamanlama çizelgesini bozuyordu, düzelttim.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_007", title: "Erasmus OLA Revizyonu (Lodz)", category: "log",
        date: "2026-05-20T09:00:00Z", description: "Lodz Üniversitesi için Online Learning Agreement güncellemesi.", tags: ["Erasmus", "Lodz"], priority: "High",
        type: "Education", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-05-19T09:00:00Z" },

        hasNote: true,
        note: {
            id: "note_log007",
            title: "Ders Kodlarındaki Format Hatası",
            content: "4. Sınıf 1. Dönem asil olarak kazandığım Lodz Üniversitesi'ne yolladığım Online Learning Agreement (OLA) evrakında küçük ama kritik bir formatlama hatası yapmışım. Ders kodlarının sonuna dönemi belirten '-WINTER' uzantısını eklemeyi tamamen unutmuşum. Karşı okulun koordinatörü belgeyi reddedince sisteme girip OLA'yı yeniden düzenledim ve tüm ders kodlarına tek tek -WINTER ekini koyarak tekrar onaya yolladım.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_19", text: "Reddedilen OLA'yı sistemden geri çek", isCompleted: true },
            { id: "todo_20", text: "Seçilen 5 dersin koduna -WINTER son ekini yaz", isCompleted: true },
            { id: "todo_21", text: "Çukurova koordinatörüne durumu anlatan bir mail at", isCompleted: true },
            { id: "todo_22", text: "Lodz koordinatöründen son onayı bekle", isCompleted: false }
        ],
        hasMedia: true,
        media: { photos: [], docs: ["/assets/fake_docs/signed_ola_winter.pdf"], audio: [] }
    },
    {
        id: "log_008", title: "Movie App GitHub Yayını", category: "log",
        date: "2026-05-24T15:00:00Z", description: "Film ve aktör arama uygulamasının repoya yüklenmesi.", tags: ["React Native", "Dev"], priority: "High",
        type: "Work", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log008",
            title: "Proje Tamamlandı",
            content: "Kullanıcıların API üzerinden filmleri ve aktörleri aratabildiği, detaylarını görebildiği React Native mobil uygulamamı bitirdim. Komponent mimarisini olabildiğince modüler tuttum. Reponun okunabilirliğini artırmak için çok detaylı ve şık bir README.md dosyası hazırladım. Uygulamanın ekran görüntülerini de repoya dahil ettim.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: true,
        media: { photos: ["/assets/fake_images/movie_app_screen1.png"], docs: [], audio: [] }
    },
    {
        id: "log_009", title: "N8n Telegram Image Bot", category: "log",
        date: "2026-05-28T20:00:00Z", description: "Telegram üzerinden çalışan görüntü işleme botu.", tags: ["AI", "n8n", "Bot"], priority: "High",
        type: "Work", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log009",
            title: "Dil Çıktısı Sorunu Çözüldü",
            content: "N8n platformunda kurduğum Telegram bot flow'unda bir sıkıntı vardı. Görüntüyü analiz eden yapay zeka bazen Türkçe, bazen İngilizce yanıt üretiyordu. Prompt mühendisliği kısmına girip Türkçe olayını tamamen devre dışı bıraktım. Artık sistemin sadece ve sadece tek bir çıktısı var, o da katı bir şekilde İngilizce. Çift dil olduğunda workflow'un ilerleyen aşamalarında regex ve parse hataları alıyordum, bu kısıtlama sistemi çok hızlandırdı.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_23", text: "BotFather'dan alınan token'ı n8n'e bağla", isCompleted: true },
            { id: "todo_24", text: "Görüntüyü base64'e çeviren node'u ekle", isCompleted: true },
            { id: "todo_25", text: "AI promptunu 'Strictly output ONLY in English' olarak değiştir", isCompleted: true },
            { id: "todo_26", text: "Telegram Reply node'unu akışın sonuna bağla", isCompleted: true }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_010", title: "Fitness Tracking: RIR Algoritması", category: "log",
        date: "2026-05-30T18:00:00Z", description: "Reps in Reserve (RIR) mantığının koda dökülmesi.", tags: ["Fitness", "React Native"], priority: "Medium",
        type: "Work", isFavorite: false,
        
        hasLocation: true, location: { address: "MacFit, M1 Merkez" },
        hasReminder: true, reminder: { date: "2026-05-30T16:00:00Z" },

        hasNote: true,
        note: {
            id: "note_log010",
            title: "Gelişim Odaklı Antrenman",
            content: "Yaptığım fitness takip uygulamasının en büyük farkı klasik set/tekrar yerine RIR (Reps in Reserve - Tükenişe Kalan Tekrar) mantığına dayanması olacak. Bugün kullanıcıdan RIR değerini alıp, bir sonraki hafta ağırlık artırıp artırmaması gerektiğini öneren ufak bir matematiksel algoritma yazdım. RIR 0 ise ağırlık sabit kalıyor, RIR 2 ve üzeriyse ağırlık artışı öneriyor.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },

    // ==========================================
    // HAZİRAN 2026 - LOGLAR (Geçmiş)
    // ==========================================
    {
        id: "log_011", title: "Erasmus Lodz Konaklama Araştırması", category: "log",
        date: "2026-06-03T11:00:00Z", description: "Lumumby kampüsündeki yurtların incelenmesi.", tags: ["Erasmus", "Travel"], priority: "High",
        type: "Travel", isFavorite: false,
        
        hasLocation: true, location: { address: "Lumumby Campus, Łódź, Poland" },
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log011",
            title: "Yurt Opsiyonları ve Ücretler",
            content: "Polonya'daki Erasmus sürecim için konaklama seçeneklerini araştırdım. Lumumby öğrenci kampüsü hem uygun fiyatlı hem de okula yakın olduğu için ilk tercihim. Tek kişilik odalar çok çabuk tükeniyormuş, bu yüzden başvuru sisteminin açıldığı gün anında kayıt yapmam lazım. Özel paylaşımlı odaların fiyatlarını da B planı olarak listeledim.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_27", text: "Lodz yurt portalında hesap aç", isCompleted: true },
            { id: "todo_28", text: "Yurt depozitosu için uluslararası transfer yöntemlerini araştır", isCompleted: true },
            { id: "todo_29", text: "Olası oda arkadaşları için Erasmus gruplarına yaz", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_012", title: "Vergi İadesi (Tax Refund) Takibi", category: "log",
        date: "2026-06-08T10:00:00Z", description: "New Jersey eyalet vergi dairesi portalından durum kontrolü.", tags: ["Finance", "WAT"], priority: "Medium",
        type: "Finance", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-06-08T09:00:00Z" },

        hasNote: false, note: null,
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_013", title: "RAG Pipeline Okumaları", category: "log",
        date: "2026-06-12T21:00:00Z", description: "Büyük dil modelleri için Retrieval-Augmented Generation araştırması.", tags: ["AI", "Education"], priority: "Low",
        type: "Education", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log013",
            title: "Vektör Veritabanı Mimarisi",
            content: "AI botlarımı daha akıllı hale getirmek için RAG yapılarını araştırmaya başladım. PDF dosyalarını parçalara (chunks) bölüp, bunları bir vektör veritabanına (Pinecone veya ChromaDB) gömmek (embedding) oldukça ilgimi çekti. Kullanıcı soru sorduğunda tüm dokümanı okutmak yerine sadece benzerlik skoru yüksek olan kısımları prompta dahil etmek muazzam bir maliyet ve hız avantajı sağlıyor.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_014", title: "React Native FlatList Optimizasyonu", category: "log",
        date: "2026-06-16T14:00:00Z", description: "Takvim altındaki veri listesinin kaydırma performansının artırılması.", tags: ["React Native", "Frontend"], priority: "High",
        type: "Work", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log014",
            title: "Scroll Bellek Sızıntısı Sorunu",
            content: "Ekrana çok fazla dummy veri basınca kaydırma yaparken uygulamanın kasıldığını (frame drop) fark ettim. FlatList bileşenine initialNumToRender={10}, maxToRenderPerBatch={10} ve windowSize={5} özelliklerini ekleyerek bellek kullanımını inanılmaz derecede düşürdüm. Artık binlerce satır veri olsa bile uygulama yağ gibi akıyor.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_30", text: "Tüm FlatList'lerde keyExtractor prop'unu tanımla", isCompleted: true },
            { id: "todo_31", text: "getItemLayout kullanarak dinamik yükseklik hesaplamasını kaldır", isCompleted: true },
            { id: "todo_32", text: "Render Item fonksiyonlarını useCallback ile sarmala", isCompleted: true }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },

    // ==========================================
    // HAZİRAN 2026 - PLANLAR (Gelecek)
    // ==========================================
    {
        id: "plan_001", title: "Dummy Data Genişletmesi", category: "plan", status: "In Progress",
        date: "2026-06-19T10:00:00Z", description: "Arayüz UI/UX testleri için mock verilerin çoğaltılması.", tags: ["React Native"], priority: "High",
        type: "Work", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-06-19T09:30:00Z" },

        hasNote: true,
        note: {
            id: "note_plan001",
            title: "Veritabanı Öncesi Stress Testi",
            content: "Gerçek Appwrite veritabanını bağlamadan önce, arayüzdeki FlatList, scroll hataları, koşullu render (conditional rendering) senaryoları ve dinamik tema değişimlerinin performansını sınırda ölçmek için devasa bir dummy data yapısı kurmam gerekti. Bu zenginleştirilmiş yapı sayesinde bileşenlerin metin uzadıkça nasıl taşma (overflow) yaptığını güvenle test edebileceğim.",
            isVisible: false 
        },
        hasTodos: true,
        todos: [
            { id: "todo_33", text: "Log olanlardan status propertysini tamamen kaldır", isCompleted: true },
            { id: "todo_34", text: "Objelere hasNote, hasTodos boolean değişkenleri ekle", isCompleted: true },
            { id: "todo_35", text: "Not metinlerini ScrollView'i tetikleyecek kadar uzat", isCompleted: true },
            { id: "todo_36", text: "Todo maddelerine isCompleted flag'i koy", isCompleted: true },
            { id: "todo_37", text: "Detay sayfası (box/[id].jsx) veri çekme testlerini yap", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_002", title: "Polonya Uçak Bileti Fiyat Takibi", category: "plan", status: "In Progress",
        date: "2026-06-20T09:00:00Z", description: "Eylül başı için Lodz veya Varşova inişli uçuş rotaları.", tags: ["Erasmus", "Travel"], priority: "High",
        type: "Travel", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-06-20T08:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan002",
            title: "Skyscanner ve Alternatif Rotalar",
            content: "Direkt Varşova uçuşları şu an bütçemi çok aşıyor. Viyana veya Budapeşte üzerinden aktarmalı uçup oradan tren veya Flixbus ile Polonya'ya geçmek daha ekonomik olabilir. Fiyat alarmlarını kurdum. Bagaj haklarını (özellikle 20kg üzeri kabin ve teslim bagajı) dikkatlice kontrol etmem lazım.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_38", text: "Skyscanner'da 15-25 Eylül arası için alarm kur", isCompleted: true },
            { id: "todo_39", text: "WizzAir ve Ryanair bagaj politikalarını oku", isCompleted: false },
            { id: "todo_40", text: "Varşova havalimanından Lodz'a tren saatlerini çıkar", isCompleted: false }
        ],
        hasMedia: true,
        media: { photos: ["/assets/fake_images/flight_prices.png"], docs: [], audio: [] }
    },
    {
        id: "plan_003", title: "Appwrite Yetkilendirme (Rules)", category: "plan", status: "Draft",
        date: "2026-06-22T14:30:00Z", description: "Kullanıcıların sadece kendi verilerini görmesi için yetki ayarları.", tags: ["Backend"], priority: "High",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-06-21T10:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan003",
            title: "Veri Güvenliği ve Rol Atamaları",
            content: "Kullanıcı login olduğunda herkesin verisi ortak havuzdan gelmemeli. Appwrite konsolunda Database Permissions kısmına gidip her bir Collection için Document Level Security (Belge Seviyesi Güvenlik) kurallarını aktif etmeliyim. Böylece okuma (read) ve yazma (write) hakları sadece 'Role:member' veya işlemi oluşturan 'User ID' ile kısıtlanmış olacak.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_41", text: "Appwrite konsolunda Permissions sekmesini aç", isCompleted: false },
            { id: "todo_42", text: "Document Level Security özelliğini enable yap", isCompleted: false },
            { id: "todo_43", text: "Post oluştururken create() fonksiyonuna userID'yi inject et", isCompleted: false },
            { id: "todo_44", text: "Farklı bir test hesabıyla login olup yetkiyi doğrula", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_004", title: "Spor: Sırt & Biceps Antrenmanı", category: "plan", status: "Scheduled",
        date: "2026-06-24T19:00:00Z", description: "Haftalık ağırlık antrenmanı planı.", tags: ["Fitness"], priority: "Medium",
        type: "Fitness", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: false, note: null,
        hasTodos: true,
        todos: [
            { id: "todo_45", text: "Lat Pulldown (4x10 - RIR 1)", isCompleted: false },
            { id: "todo_46", text: "Barbell Row (3x8 - RIR 0)", isCompleted: false },
            { id: "todo_47", text: "Cable Biceps Curl (4x12 - RIR 2)", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_005", title: "Erasmus Vize Evrak Listesi", category: "plan", status: "Draft",
        date: "2026-06-26T10:00:00Z", description: "D Tipi Ulusal Vize (Polonya) için belgelerin toparlanması.", tags: ["Erasmus", "Finance"], priority: "High",
        type: "Travel", isFavorite: true,
        
        hasLocation: true, location: { address: "VFS Global Visa Application Center" },
        hasReminder: true, reminder: { date: "2026-06-25T14:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan005",
            title: "VFS Global Randevu ve Kritik Evraklar",
            content: "Polonya Ulusal vizesi almak son dönemde oldukça zorlaştı. Gerekli tüm evrakların eksiksiz, güncel tarihli ve İngilizce olması gerekiyor. Hibe belgem henüz ıslak imzalı olarak çıkmadığı için banka dökümlerinde güçlü bir finansal bakiye göstermek zorundayım. Pasaportumun geçerlilik süresi eğitim dönemi bittikten sonra en az 3 ay daha devam ediyor, o kısımda sorun yok.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_48", text: "Lodz Üniversitesi'nden gelen kabul mektubunun orijinal çıktısını al", isCompleted: false },
            { id: "todo_49", text: "Minimum 30.000 EUR teminatlı, tüm eğitim dönemini kapsayan seyahat sağlık sigortası yaptır", isCompleted: false },
            { id: "todo_50", text: "Son 3 aylık banka hesap dökümünü bankadan ıslak imzalı ve kaşeli şekilde teslim al", isCompleted: false },
            { id: "todo_51", text: "Öğrenci belgesi ve transkripti e-Devlet üzerinden barkodlu İngilizce çıkar", isCompleted: false },
            { id: "todo_52", text: "VFS Global üzerinden konsolosluk vize randevusu tarihini kovala", isCompleted: false }
        ],
        hasMedia: true,
        media: { photos: [], docs: ["/assets/fake_docs/poland_visa_checklist.pdf"], audio: [] }
    },
    {
        id: "plan_006", title: "Movie App Canlı Arama (Debounce)", category: "plan", status: "Draft",
        date: "2026-06-29T14:00:00Z", description: "Kullanıcı harf girdikçe API yormamak için gecikmeli arama.", tags: ["Frontend", "React Native"], priority: "Medium",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_plan006",
            title: "API İstek Sınırları ve Debounce",
            content: "Arama çubuğuna kullanıcının girdiği her bir harf için TMDB API'sine anlık istek atmak hem kotayı çabuk dolduruyor hem de eski isteklerin yeni isteklerle çakışıp yarış durumuna (race condition) düşmesine sebep oluyor. Lodash kütüphanesinin debounce fonksiyonunu kullanarak kullanıcının yazmayı bitirmesinin ardından 500ms bekleyip tek bir istek atacak şekilde arama çubuğunu optimize edeceğim.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_53", text: "Lodash kütüphanesini projeye dahil et (npm i lodash)", isCompleted: false },
            { id: "todo_54", text: "useCallback hook'u içine lodash.debounce sarıcısı yaz", isCompleted: false },
            { id: "todo_55", text: "Arama input'unun onChangeText event'ine bağla", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },

    // ==========================================
    // TEMMUZ 2026 - PLANLAR (Gelecek)
    // ==========================================
    {
        id: "plan_007", title: "Kredi Kartı Limit ve Döviz Artırımı", category: "plan", status: "Draft",
        date: "2026-07-02T10:00:00Z", description: "Yurtdışı harcamaları için banka görüşmesi ve limit ayarları.", tags: ["Finance", "Travel"], priority: "High",
        type: "Finance", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-07-01T15:00:00Z" },

        hasNote: false, note: null,
        hasTodos: true,
        todos: [
            { id: "todo_56", text: "Müşteri hizmetlerini arayıp kredi kartını yurtdışı işlemlerine açtır", isCompleted: false },
            { id: "todo_57", text: "Döviz ekstre (USD/EUR) özelliğini aktif et (Kur farkı zararı yememek için)", isCompleted: false },
            { id: "todo_58", text: "Fiziksel nakit (Zloty veya Euro) temin edebileceğin bir döviz bürosu bul", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_008", title: "Appwrite Storage Profil Fotoğrafı", category: "plan", status: "Draft",
        date: "2026-07-06T11:00:00Z", description: "Kullanıcıların profil fotoğrafı yükleme ve güncelleme akışı.", tags: ["Backend", "React Native"], priority: "Medium",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-07-06T10:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan008",
            title: "Expo Image Picker ve FormData",
            content: "Kullanıcının galerisinden veya kamerasından resim seçmesini sağlamak için expo-image-picker kütüphanesini kuracağım. Seçilen fotoğrafı Appwrite Storage bucket'ına yükleyip, oradan dönen File ID ile User Preferences tablosunu güncelleyeceğim. Fotoğrafın boyutunun yüksek olmasını engellemek için yüklemeden önce resmi yeniden boyutlandırmam (resize/compress) gerekecek.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_59", text: "expo-image-picker modülünü kur ve app.json izinlerini ayarla", isCompleted: false },
            { id: "todo_60", text: "Appwrite Storage üzerinde yeni bir Bucket (Kova) oluştur", isCompleted: false },
            { id: "todo_61", text: "Fotoğraf yükleme fonksiyonunu (createFile) entegre et", isCompleted: false },
            { id: "todo_62", text: "Yüklenen fotoğrafın URL'sini önbellekle (Image caching)", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_009", title: "RAG Pipeline Testleri", category: "plan", status: "Draft",
        date: "2026-07-09T16:00:00Z", description: "PDF verilerinden AI'ın doğru cevap çekip çekmediğinin kontrolü.", tags: ["AI"], priority: "High",
        type: "Education", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: false, note: null,
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_010", title: "Lodz Yurt Başvurusu (Lumumby)", category: "plan", status: "Draft",
        date: "2026-07-12T12:00:00Z", description: "Online portal üzerinden yurt seçimi ve depozito yatırma.", tags: ["Erasmus"], priority: "High",
        type: "Travel", isFavorite: true,
        
        hasLocation: true, location: { address: "Lumumby Campus Housing Office, Lodz" },
        hasReminder: true, reminder: { date: "2026-07-12T09:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan010",
            title: "Kritik Yurt Seçim Süreci",
            content: "Uluslararası ilişkiler ofisinden gelen maile göre yurt başvuru ekranı Polonya saatiyle sabah 10:00'da açılacak. Tek kişilik odalar veya yenilenmiş binalar çok talep gördüğü için bilgisayar başında hazır bekleyeceğim. Eğer yurt çıkmazsa özel kiralama sitelerinden acilen oda bakmaya başlamam gerekecek.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_63", text: "Başvuru günü saat farkını (TSİ) hesaplayarak alarm kur", isCompleted: false },
            { id: "todo_64", text: "Pasaport ve kabul belgesinin dijital kopyalarını masaüstünde hazır tut", isCompleted: false },
            { id: "todo_65", text: "Portal çökerse yenilemek için alternatif bir tarayıcı açık kalsın", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_011", title: "Fitness App Grafik Rapor Ekranı", category: "plan", status: "Draft",
        date: "2026-07-18T14:00:00Z", description: "RIR gelişimi ve ağırlık artışlarının grafiklerle (ChartKit) gösterilmesi.", tags: ["Frontend", "Fitness"], priority: "Medium",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-07-17T18:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan011",
            title: "Veri Görselleştirme Kütüphaneleri",
            content: "Kullanıcının geçmiş antrenmanlara ait RIR verilerini ve kaldırdığı maksimum ağırlıkları görselleştirmek çok şık duracak. react-native-chart-kit kütüphanesini kullanarak basit, okunabilir çizgi (line) grafikleri oluşturacağım. Ekran dar olduğunda yatay kaydırılabilir (scrollable) bir grafik alanı oluşturmam gerekiyor.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_66", text: "Veritabanından kullanıcının geçmiş 30 günlük antrenman verilerini çek", isCompleted: false },
            { id: "todo_67", text: "Verileri grafiğin okuyabileceği [X, Y] array formatına parse et", isCompleted: false },
            { id: "todo_68", text: "Grafik renklerini uygulamanın seçili aktif temasına (dark/light) bağla", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },

    // ==========================================
    // YENİ EKLENEN EKSTRA 5 VERİ
    // ==========================================
    {
        id: "log_015", title: "Appwrite Veritabanı Optimizasyonu", category: "log",
        date: "2026-06-17T11:00:00Z", description: "Sorgu hızını artırmak için indekslemelerin eklenmesi.", tags: ["Backend", "Database"], priority: "Medium",
        type: "Work", isFavorite: true,
        
        hasLocation: false, location: null,
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log015",
            title: "Index Kullanımı ile Performans Artışı",
            content: "Veritabanında logları çekerken kullanıcı ID'sine ve tarihe göre sıkça filtreleme yapıyoruz. Bu durum tablo büyüdükçe performansı olumsuz etkiliyor. Appwrite konsolu üzerinden koleksiyona gidip 'user_id' ve 'date' özelliklerini kullanarak yeni bir Index tanımladım. Query'lerin çalışma süresini saliselere kadar düşürmeyi başardım.",
            isVisible: true
        },
        hasTodos: false, todos: [],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "log_016", title: "Lodz Uçak Bileti Alımı", category: "log",
        date: "2026-06-18T15:30:00Z", description: "Eylül ayı gidiş uçuşunun Viyana aktarmalı satın alınması.", tags: ["Erasmus", "Travel"], priority: "High",
        type: "Travel", isFavorite: true,
        
        hasLocation: true, location: { address: "Adana Şakirpaşa Havalimanı (ADA)" },
        hasReminder: false, reminder: null,

        hasNote: true,
        note: {
            id: "note_log016",
            title: "Uçuş ve Bagaj Planlaması",
            content: "Alarm kurduğum bilet fiyatlarında ufak bir düşüş yakalayıp Viyana aktarmalı uçuşu hemen satın aldım. Bagaj kuralları çok katı olduğu için ekstra kabin bagajı satın almak zorunda kaldım. Viyana'ya indikten sonra Flixbus ile Lodz'a direkt geçiş yapmayı planlıyorum, böylece hem daha ucuz hem de manzaralı bir yolculuk olacak.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_69", text: "Biletlerin PNR kodlarını ve faturalarını mailde yıldızla", isCompleted: true },
            { id: "todo_70", text: "Viyana havalimanından Lodz'a giden Flixbus seferlerini incele", isCompleted: false }
        ],
        hasMedia: true,
        media: { photos: [], docs: ["/assets/fake_docs/flight_ticket_vienna.pdf"], audio: [] }
    },
    {
        id: "plan_012", title: "React Native Reanimated Denemeleri", category: "plan", status: "Draft",
        date: "2026-07-21T10:00:00Z", description: "UI geçişleri için performanslı animasyonların test edilmesi.", tags: ["Frontend", "React Native"], priority: "Low",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-07-20T20:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan012",
            title: "Shared Value ve UI Thread",
            content: "Uygulamadaki buton tıklamaları ve liste geçişleri biraz yavan hissettiriyor. React Native'in kendi animasyon API'si yerine Reanimated 3 kullanarak Shared Values üzerinden animasyonları UI thread üzerinde çalıştıracağım. Bu, JS thread'ini meşgul etmeyeceği için uygulamanın kasmamasını sağlayacaktır.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_71", text: "Babel.config.js dosyasına plugin ayarlarını ekle", isCompleted: false },
            { id: "todo_72", text: "Butonlar için basit bir scale (büyüme/küçülme) animasyonu yaz", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_013", title: "Spor: Omuz & Karın", category: "plan", status: "Scheduled",
        date: "2026-07-23T18:00:00Z", description: "Dambıl odaklı omuz ve mat üzeri karın egzersizleri.", tags: ["Fitness"], priority: "Medium",
        type: "Fitness", isFavorite: true,
        
        hasLocation: true, location: { address: "MacFit, M1 Merkez, Adana" },
        hasReminder: true, reminder: { date: "2026-07-23T16:00:00Z" },

        hasNote: false, note: null,
        hasTodos: true,
        todos: [
            { id: "todo_73", text: "Dumbbell Shoulder Press (4x10 - RIR 1)", isCompleted: false },
            { id: "todo_74", text: "Lateral Raise (4x12 - RIR 0)", isCompleted: false },
            { id: "todo_75", text: "Plank (3x Maksimum süre)", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    },
    {
        id: "plan_014", title: "N8n Telegram Botu Deployment", category: "plan", status: "Draft",
        date: "2026-07-25T14:00:00Z", description: "Local'de çalışan n8n akışının sunucuya taşınması.", tags: ["AI", "Server"], priority: "High",
        type: "Work", isFavorite: false,
        
        hasLocation: false, location: null,
        hasReminder: true, reminder: { date: "2026-07-24T12:00:00Z" },

        hasNote: true,
        note: {
            id: "note_plan014",
            title: "DigitalOcean Üzerinde Docker Setup",
            content: "Şu an n8n sadece benim bilgisayarım açıkken çalışıyor. Telegram botunun 7/24 aktif olabilmesi için DigitalOcean'dan uygun fiyatlı bir Droplet kiralayıp Docker Compose ile n8n'i oraya deploy edeceğim. Ayrıca webhook adresleri değişeceği için BotFather üzerinden yeni IP ve portu tanıtmam gerekecek.",
            isVisible: true
        },
        hasTodos: true,
        todos: [
            { id: "todo_76", text: "DigitalOcean Droplet oluştur (Ubuntu & Docker)", isCompleted: false },
            { id: "todo_77", text: "docker-compose.yml dosyasını sunucuya çek ve çalıştır", isCompleted: false },
            { id: "todo_78", text: "BotFather'da webhook URL'sini sunucu adresiyle güncelle", isCompleted: false }
        ],
        hasMedia: false,
        media: { photos: [], docs: [], audio: [] }
    }
];