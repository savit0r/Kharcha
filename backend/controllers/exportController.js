import pool from "../config/db.js";
import PDFDocument from "pdfkit";

// @desc    Export transactions to PDF
// @route   GET /api/export/transactions/pdf
// @access  Private
export const exportTransactionsPDF = async (req, res) => {
    try {
        // Fetch User Info
        const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [req.userId]);
        if (userRes.rows.length === 0) return res.status(404).send("User not found");
        const user = userRes.rows[0];

        // Fetch Transactions
        const query = `
            SELECT t.title, t.amount, t.type, t.date, c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
            ORDER BY t.date DESC, t.created_at DESC
        `;
        const result = await pool.query(query, [req.userId]);
        const transactions = result.rows;

        // Initialize PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Setup response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Kharcha_Statement_${new Date().toISOString().split('T')[0]}.pdf"`);

        // Pipe the PDF directly to the response stream
        doc.pipe(res);

        // Header
        doc.fontSize(24).text('Kharcha Statement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`);
        doc.moveDown(2);

        // Summary
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);

        doc.fontSize(14).text('Summary');
        doc.fontSize(10).text(`Total Income: +₹${totalIncome.toLocaleString('en-IN')}`, { color: 'green' });
        doc.text(`Total Expense: -₹${totalExpense.toLocaleString('en-IN')}`, { color: 'red' });
        doc.text(`Net Balance: ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}`, { color: 'black' });
        doc.moveDown(2);

        // Table Header
        doc.fontSize(12).text('Transaction History');
        doc.moveDown();

        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Date', 50, tableTop, { width: 90 });
        doc.text('Title', 140, tableTop, { width: 170 });
        doc.text('Category', 310, tableTop, { width: 100 });
        doc.text('Amount', 410, tableTop, { width: 90, align: 'right' });

        // Draw underline
        doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        let y = tableTop + 25;

        // Table Rows
        doc.font('Helvetica');
        transactions.forEach((t) => {
            // Check for page break
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const formattedDate = new Date(t.date).toLocaleDateString('en-IN');
            const amountPrefix = t.type === 'income' ? '+' : '-';
            const amountColor = t.type === 'income' ? 'green' : 'red';

            doc.fillColor('black');
            doc.text(formattedDate, 50, y, { width: 90 });
            doc.text(t.title, 140, y, { width: 170 });
            doc.text(t.category_name || 'Uncategorized', 310, y, { width: 100 });

            doc.fillColor(amountColor);
            doc.text(`${amountPrefix}₹${parseFloat(t.amount).toLocaleString('en-IN')}`, 410, y, { width: 90, align: 'right' });

            y += 20;
        });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error("Error generating PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error generating PDF" });
        }
    }
};
