# خطوتك لتفعيل الـ CRM على Google Sheets

هذا الكود سيحول ملف (جوجل شيت) الخاص بك إلى قاعدة بيانات تستقبل الطلبات من موقعك فوراً وبشكل صامت.

### الخطوات التي يجب عليك فعلها:
1. اذهب إلى [Google Sheets](https://docs.google.com/spreadsheets/) وقم بإنشاء جدول بيانات جديد وفارغ بقائمة (Blank).
2. في القائمة العلوية، اضغط على **Extensions (الإضافات)** ثم اختر **Apps Script (برمجة التطبيقات)**.
3. امسح أي كود موجود في المربع الأبيض هناك، وانسخ الكود الموجود بالأسفل بالكامل والصقه هناك.
4. اضغط على الزر الأزرق بالأعلى **Deploy (نشر)** واختر **New Deployment (نشر جديد)**.
5. انقر على أيقونة الترس بجانب (Select type) واختر **Web App (تطبيق ويب)**.
6. في الشاشة التي ستظهر:
   - الوصف: `Mashhour Hub CRM v1`
   - في خانة Who has access (من يمكنه الوصول): اختر **Anyone (أي شخص)** (هذا ضروري جداً).
7. اضغط **Deploy (نشر)**. (ستطلب منك جوجل الموافقة على الأمان، وافق باختيار حسابك، ثم Advanced، ثم Go to project).
8. انسخ الـ **Web App URL (رابط التطبيق)** الطويل الذي يظهر لك، ثم انسخه لي هنا لأقوم بربط موقعك به فوراً!

---

### الكود البرمجي (انسخه بالكامل):

```javascript
// Mashhour Hub CRM - Advanced Submission Handler
// Created by Deepmind Antigravity Agent

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    // Default to Inbox, or use the formType passed from frontend
    var sheetName = e.parameter.formType || "Inbox";
    var sheet = doc.getSheetByName(sheetName);
    
    // Auto-create category sheet if it doesn't exist
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    var newRow = [];
    
    // Automatically construct headers if sheet is empty
    if (headers.length <= 1 && headers[0] == "") {
      headers = Object.keys(e.parameter);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Format headers bold
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    }
    
    // Map values to matching columns
    for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (e.parameter[header] !== undefined) {
          // If multiple checkboxes match the key, join them
          var value = Array.isArray(e.parameter[header]) ? e.parameter[header].join(', ') : e.parameter[header];
          newRow.push(value);
        } else {
          newRow.push("");
        }
    }
    
    // Insert new Record
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow, "category": sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```
