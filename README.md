# Equipment Check-In/Out System

A web-based barcode scanning system for managing equipment loans to students.

## Features

- **Barcode Scanning**: USB barcode scanner support for quick check-in/check-out
- **Student Management**: Add, edit, and track students with barcode IDs
- **Equipment Management**: Maintain inventory of equipment with barcode tracking
- **Transaction History**: Complete audit trail of all check-in/check-out activities
- **Reports & Analytics**: Real-time statistics and overdue tracking
- **Expected Return Times**: Set due dates for equipment returns
- **Batch Operations**: Check in multiple items at once for a student
- **Local Storage**: All data saved in browser localStorage

## Pre-loaded Equipment

The system comes pre-loaded with:
- 8 WACS Tripods (WACS TRIPOD 1-8)
- 11 Rode Microphones (Rode Mic 1-11)

## Getting Started

1. Open `index.html` in a web browser
2. Add students via the "Students" tab
3. Add additional equipment via the "Equipment" tab (optional)
4. Use the "Scan" tab to scan student passes and equipment barcodes

## Usage

### Checking Out Equipment

1. Navigate to the "Scan" tab
2. Scan a student barcode
3. Scan an equipment barcode
4. Set expected return date/time
5. Add optional notes
6. Confirm checkout

### Checking In Equipment

1. Navigate to the "Scan" tab
2. Scan the equipment barcode (no need to scan student first)
3. Review the checkout details
4. Add optional check-in notes
5. Confirm check-in

### Student with Multiple Items

When scanning a student who has equipment checked out:
- Check in individual items
- Check in all items at once
- Check out additional equipment

## File Structure

```
Equp Check/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── app.js          # Application logic
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Data Persistence

All data is stored in browser localStorage:
- Students
- Equipment
- Transactions

**Note**: Clearing browser data will delete all records. Consider implementing export/import functionality for backups.

## Future Enhancements

- Export/import data to JSON
- Print reports
- Email notifications for overdue items
- Mobile app version
- Database backend for multi-user access
- Photo capture on check-in/out
- Damage reporting

## License

Free to use and modify for educational purposes.
