# Bulk Import & Photo Features Guide

## New Features Added

### 1. Bulk Import Students
### 2. Bulk Import Equipment
### 3. Student Photos

---

## How to Bulk Import Students

1. Go to the **Students** tab
2. Click the **"+ Bulk Import Students"** button
3. Enter student data in the text area, one student per line
4. Format: `Name, Barcode, Email` (email is optional)

### Example Format:
```
John Doe, 123456, john@school.edu
Jane Smith, 789012
Bob Johnson, 345678, bob@school.edu
Sarah Wilson, 456789
```

5. Click **"Import Students"** button
6. You'll see a summary of how many were added/skipped

### Notes:
- Students with duplicate barcodes will be skipped
- Empty lines are ignored
- Email is optional (can leave blank)

---

## How to Bulk Import Equipment

1. Go to the **Equipment** tab
2. Click the **"+ Bulk Import Equipment"** button
3. Enter equipment data in the text area, one item per line
4. Format: `Type, Barcode, Description` (description is optional)

### Example Format:
```
Camera, CAM001, Sony A7III
Tripod, TRI001
Microphone, MIC001, Rode Wireless GO
Light Kit, LIGHT001, Neewer 2-Pack
Camera, CAM002, Canon EOS R5
```

### Valid Equipment Types:
- Microphone
- Tripod
- Camera
- Light Kit
- Audio Recorder
- Lens
- Other

5. Click **"Import Equipment"** button
6. You'll see a summary of how many were added/skipped

### Notes:
- Equipment with duplicate barcodes will be skipped
- Empty lines are ignored
- Description is optional

---

## How to Add Student Photos

### When Adding a New Student:

1. Go to the **Students** tab
2. Click **"+ Add Student"**
3. Fill in student information
4. Click **"Choose File"** under the Photo field
5. Select a photo (JPG, PNG, etc.)
6. You'll see a preview of the photo
7. Click **"Save Student"**

### When Editing an Existing Student:

1. Click **"Edit"** next to the student name
2. You'll see their current photo (if they have one)
3. To change it, click **"Choose File"** and select a new photo
4. Click **"Update Student"**

### Photo Requirements:
- Maximum file size: 500KB
- Supported formats: JPG, PNG, GIF, etc.
- Photos are stored in browser localStorage

---

## How Student Photos Are Displayed

### During Check-Out:
1. When you scan a student's barcode
2. Then scan equipment to check out
3. **The student's photo will appear** in the transaction details
4. Photo shows with name and email before confirming

### During Check-In Options:
1. When you scan a student who has equipment checked out
2. **Their photo appears** next to their name
3. Makes it easy to verify the correct student

---

## Tips & Best Practices

### For Bulk Imports:
- Prepare your data in Excel/Google Sheets first
- Export to CSV or copy directly
- Paste into the bulk import form
- Check for duplicate barcodes beforehand

### For Photos:
- Use clear, face-forward photos
- Keep file sizes small (under 500KB)
- Square photos work best (1:1 ratio)
- Good lighting helps with recognition
- Consider taking photos with webcam during registration

### Storage Notes:
- All data (including photos) is stored in browser localStorage
- Each browser has ~5-10MB limit for localStorage
- Photos are stored as Base64 encoded strings
- Consider the 500KB limit per photo to manage space
- With 500KB photos, you can store ~20-40 student photos comfortably

---

## Sample Data for Testing

### Students:
```
Alice Johnson, STU001, alice@school.edu
Bob Martinez, STU002, bob@school.edu
Carol Chen, STU003, carol@school.edu
David Kim, STU004
Emily Rodriguez, STU005, emily@school.edu
```

### Equipment:
```
Camera, CAM003, Sony A7IV
Camera, CAM004, Canon R6
Tripod, TRI009, Manfrotto Carbon
Tripod, TRI010, Benro Aluminum
Microphone, MIC012, Shure SM7B
Microphone, MIC013, Rode NTG4+
Light Kit, LIGHT001, Godox SL60W
Light Kit, LIGHT002, Aputure 300D
Audio Recorder, REC001, Zoom H6
Lens, LENS001, Sony 24-70mm f/2.8
```

---

## Troubleshooting

**Q: My bulk import isn't working**
- Check your format - must be comma-separated
- Make sure there are no extra commas
- Verify no duplicate barcodes exist

**Q: Photo upload failed**
- Check file size (must be under 500KB)
- Try compressing the image first
- Use online tools like TinyPNG or CompressJPEG

**Q: Photos not showing**
- Clear browser cache and reload
- Make sure you saved the student after uploading
- Check browser console for errors

**Q: Running out of storage space**
- Compress photos before uploading
- Delete old transaction history
- Use photos closer to 100-200KB size

---

## Future Enhancements

Potential improvements for later:
- CSV file upload instead of text paste
- Photo compression on upload
- Batch photo upload for multiple students
- Export data with photos
- Cloud storage integration
- Webcam capture for photos
