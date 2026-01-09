# Шрифты для сайта

## Impact

Для корректной работы сайта необходимо добавить файлы шрифта Impact в эту папку:

### Требуемые файлы Impact:
- `impact.woff2` (рекомендуется, самый легкий формат)
- `impact.woff` (запасной вариант)
- `impact.ttf` (для совместимости со старыми браузерами)

### Где получить файлы Impact:

#### Вариант 1: Из системы Windows
Если у вас есть доступ к Windows, файл шрифта находится здесь:
```
C:\Windows\Fonts\impact.ttf
```

#### Вариант 2: Конвертация
1. Скопируйте файл `impact.ttf` из Windows
2. Конвертируйте в WOFF и WOFF2 на сайтах:
   - https://cloudconvert.com/ttf-to-woff2
   - https://cloudconvert.com/ttf-to-woff

---

## Cormorant

### Требуемые файлы Cormorant:
- `cormorant-regular.woff2` / `.woff` / `.ttf` (вес 400)
- `cormorant-medium.woff2` / `.woff` / `.ttf` (вес 500)
- `cormorant-semibold.woff2` / `.woff` / `.ttf` (вес 600)
- `cormorant-bold.woff2` / `.woff` / `.ttf` (вес 700)

### Где получить файлы Cormorant:

#### Вариант 1: Скачать с Google Fonts
1. Перейдите на https://fonts.google.com/specimen/Cormorant
2. Нажмите "Download family"
3. Извлеките нужные файлы из архива:
   - `Cormorant-Regular.ttf`
   - `Cormorant-Medium.ttf`
   - `Cormorant-SemiBold.ttf`
   - `Cormorant-Bold.ttf`

#### Вариант 2: Конвертация
1. Скачайте TTF файлы
2. Переименуйте их:
   - `Cormorant-Regular.ttf` → `cormorant-regular.ttf`
   - `Cormorant-Medium.ttf` → `cormorant-medium.ttf`
   - `Cormorant-SemiBold.ttf` → `cormorant-semibold.ttf`
   - `Cormorant-Bold.ttf` → `cormorant-bold.ttf`
3. Конвертируйте каждый в WOFF и WOFF2:
   - https://cloudconvert.com/ttf-to-woff2
   - https://cloudconvert.com/ttf-to-woff

---

### После добавления файлов:
Убедитесь, что все файлы размещены в папке `/fonts/` и названы точно так, как указано выше.

### Структура папки должна быть:
```
fonts/
├── impact.woff2
├── impact.woff
├── impact.ttf
├── cormorant-regular.woff2
├── cormorant-regular.woff
├── cormorant-regular.ttf
├── cormorant-medium.woff2
├── cormorant-medium.woff
├── cormorant-medium.ttf
├── cormorant-semibold.woff2
├── cormorant-semibold.woff
├── cormorant-semibold.ttf
├── cormorant-bold.woff2
├── cormorant-bold.woff
└── cormorant-bold.ttf
```
