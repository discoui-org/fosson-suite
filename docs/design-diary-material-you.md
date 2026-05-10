# Design Diary: Material You Theming — Auth App

> Bu belge, Proton Authenticator uygulamasını Material 3 (Material You) tasarım diline
> geçirirken karşılaştığımız gerçek sorunları ve çözümlerini belgeler.
> Diğer uygulamalara (Pass, VPN vb.) aynı süreci uygularken başvuru kaynağı olarak kullanın.

---

## 1. Bypass Stratejisi: Proton'un Renk Motorunu "Kandırmak"

### Sorun
Proton uygulamaları kendi `ThemeColors` sınıfı ve `LocalThemeColorScheme` CompositionLocal'ı üzerinden renk yönetimi yapar. Bu sistemi doğrudan değiştirmek tüm bileşenleri kırar.

### Çözüm: Proxy Pattern
`ThemeColors`'ı doğrudan değiştirmek yerine, Proton'un arayüzünü uygulayan bir `MaterialYouThemeColors` proxy sınıfı yazdık. Bu sınıf, Proton'un her renk değişkenini (`accent`, `textNorm`, `menuListBackground` vb.) Material 3'ün dinamik renk şemasına (`ColorScheme`) eşler.

```kotlin
class MaterialYouThemeColors(val m3: ColorScheme, val isDark: Boolean) : ThemeColors() {
    override val accent: Color get() = m3.primary
    override val menuListBackground: Color get() = m3.surfaceContainer
    override val textNorm: Color get() = m3.onSurface
    // ...
}
```

Ardından bu proxy'yi `CompositionLocalProvider` ile sisteme enjekte ediyoruz:

```kotlin
CompositionLocalProvider(
    LocalThemeColorScheme provides MaterialYouThemeColors(dynamicColorScheme, isDark),
    // ...
) { content() }
```

**Sonuç:** Tüm Proton bileşenleri `Theme.colorScheme.textNorm` gibi kendi API'larını çağırmaya devam eder, ancak arkada Material You renklerini alır. Hiçbir bileşene dokunmak gerekmez.

---

## 2. `ThemeTypography` object → open class Dönüşümü

### Sorun
`ThemeTypography` bir Kotlin `object` (singleton) olarak tanımlıydı. Singleton'lar extend edilemez veya override edilemez, bu yüzden Material 3 fontlarını enjekte etmek imkânsızdı.

```
e: 'interface ThemeTypography' does not have constructors.
```

### Çözüm
`ThemeTypography`'yi `open class`'a çevirdik ve tüm property'leri `open` yaptık. Geriye dönük uyumluluk için `companion object Default : ThemeTypography()` ekledik — böylece `ThemeTypography.title` gibi eski static çağrılar bozulmadı.

```kotlin
open class ThemeTypography {
    @Stable open val title: TextStyle @Composable get() = TextStyle(...)
    // ...
    companion object Default : ThemeTypography()
}
```

Ardından bir anonymous object ile bridge oluşturduk:

```kotlin
fun createM3TypographyBridge(m3: Typography): ThemeTypography = object : ThemeTypography() {
    override val title: TextStyle @Composable get() = m3.headlineMedium
    override val body1Regular: TextStyle @Composable get() = m3.bodyLarge
    // ...
}
```

> ⚠️ **Dikkat:** Override ederken SADECE orijinal sınıfta var olan property isimlerini kullanın.
> Olmayan bir ismi override etmeye çalışırsanız `'X' overrides nothing` hatası alırsınız.
> `ThemeTypography.kt` dosyasını her zaman okuyarak mevcut isimleri teyit edin.

---

## 3. `LargeTopAppBar` Scroll Animasyonu Çalışmıyor

### Sorun
`LargeTopAppBar` ile `exitUntilCollapsedScrollBehavior` kullandık ama başlık hiç küçülmüyordu.

### Temel Neden
`Box` → `Scaffold` hiyerarşisi `nestedScrollConnection`'ın alt bileşenlere ulaşmasını engelliyordu:

```kotlin
// ❌ Yanlış — Box, nestedScroll chain'ini keser
Box(modifier = Modifier.fillMaxSize()) {
    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection)
    ) { ... }
}
```

### Çözüm
`Box` sarmalayıcısını kaldırıp `nestedScroll`'u doğrudan `Scaffold`'a taşıdık. Arka plan rengini `containerColor` ile verdik:

```kotlin
// ✅ Doğru
Scaffold(
    modifier = Modifier
        .fillMaxSize()
        .nestedScroll(scrollBehavior.nestedScrollConnection),
    containerColor = MaterialTheme.colorScheme.background,
    topBar = { LargeTopAppBar(..., scrollBehavior = scrollBehavior) }
) { ... }
```

### İkinci Tuzak: İçerik `fillMaxSize()` Olmak Zorunda
`LazyColumn` veya scroll edilen içerik `fillMaxSize()` almadan scroll eventi oluşturamaz. `HomeContent`'e `Modifier.fillMaxSize()` vermek zorunlu:

```kotlin
HomeContent(
    modifier = Modifier.fillMaxSize().padding(paddingValues),
    ...
)
```

---

## 4. Search Bar — "Sticky" Olmayan Gerçek Scroll

### Sorun
Search bar'ı `topBar` Column'una koyduk ama `LargeTopAppBar`'ın `scrollBehavior`'u sadece kendi yüksekliğini kontrol eder. Column içindeki diğer bileşenler (örneğin `SearchTextField`) orada sabitlenmiş kalır.

```kotlin
// ❌ SearchTextField sticky kalır, scrollBehavior onu etkilemez
topBar = {
    Column {
        LargeTopAppBar(scrollBehavior = scrollBehavior)
        SearchTextField(...) // bu hiç kaybolmaz
    }
}
```

### Çözüm
Search bar'ı `LazyColumn`'un ilk `item`'i olarak yerleştirdik. Bunun için şu zinciri patch'ledik:

```
DraggableVerticalList ← header: (@Composable () -> Unit)? = null parametresi eklendi
    ↓
HomeEntries ← header parametresini geçirir
    ↓
HomeContent ← header parametresini geçirir
    ↓
HomeScreen ← SearchTextField'ı header olarak enjekte eder
```

`DraggableVerticalList`'teki `LazyColumn`'a ilk item olarak eklendi:

```kotlin
LazyColumn(...) {
    header?.let { headerContent ->
        item(key = "__list_header__") { headerContent() }
    }
    itemsIndexed(items = items) { ... }
}
```

**Sonuç:** Search bar artık listenin bir parçası — aşağı kaydırınca hem başlık küçülür hem search bar kaybolur.

---

## 5. `UiSelectorOption` Interface Tuzağı

### Sorun
Settings menüsünde özel bir seçenek (örn. "Default" accent color) oluştururken `UiSelectorOption(...)` gibi doğrudan çağrı yaptık. Hata:

```
Interface 'interface UiSelectorOption<T>' does not have constructors.
```

### Çözüm
Interface olduğu için constructor yoktur. Anonymous object ile implement edilmeli:

```kotlin
options = listOf(
    object : UiSelectorOption<String> {
        override val isSelected: Boolean = true
        override val text: UiText = UiText.Dynamic("Default")
        override val selectedType: String = "default"
        override val value: String = "default"
    }
)
```

> 💡 `UiText.Static` diye bir şey yoktur. Dinamik string için `UiText.Dynamic("metin")` kullanın.

---

## 6. Pitch Black ROM Uyumluluğu

### Sorun
crDroid gibi ROM'ların "pitch black" modu, sistemin `android:windowBackground`'ını siyaha çevirir. Ancak `dynamicDarkColorScheme(context)` Monet wallpaper renk tokenlarını okur — bu iki mekanizma birbirinden bağımsızdır.

### Durum
Bu, ROM'un Monet color token'larını (`android.R.color.system_neutral1_900` vb.) override etmediği sürece uygulama tarafından çözülemez. Material You app'leri (Google dahil) pitch black modundan etkilenmez. Bu beklenen bir davranıştır.

**Yapılabilecek:** ROM, Monet tokenlarını siyaha override ediyorsa `dynamicDarkColorScheme` otomatik olarak siyahı alır.

---

## Özet: Diğer Uygulamalar İçin Kontrol Listesi

| Adım | Yapılacak |
|------|-----------|
| 1 | `ThemeColors.kt` — abstract class mı, object mi? → object ise önce `open class`'a çevir |
| 2 | `ThemeTypography.kt` — aynı şekilde `open class` yap, companion object ekle |
| 3 | Mevcut property isimlerini not al, override ederken AYNI isimleri kullan |
| 4 | `FullTheme.kt` benzeri bir proxy dosyası oluştur, `newFiles`'a ekle |
| 5 | `Scaffold`'da `containerColor` kullan, `Box` sarmalayıcı koyma |
| 6 | `nestedScroll` modifier'ı `Scaffold`'a, `scrollBehavior`'u `TopAppBar`'a ver |
| 7 | İçerik composable'ına mutlaka `fillMaxSize()` ver |
| 8 | Non-sticky bileşenler için `topBar` Column yerine `LazyColumn item` kullan |
