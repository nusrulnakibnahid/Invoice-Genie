document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const shopSettingsForm = document.getElementById('shop-settings-form');
    const shopLogoInput = document.getElementById('shop-logo');
    const logoPreview = document.getElementById('logo-preview');
    const resetSettingsBtn = document.getElementById('reset-settings');
    const invoiceForm = document.getElementById('invoice-form');
    const productTable = document.getElementById('product-table').getElementsByTagName('tbody')[0];
    const addProductBtn = document.getElementById('add-product');
    const clearInvoiceBtn = document.getElementById('clear-invoice');
    const generateInvoiceBtn = document.getElementById('generate-invoice');
    const invoicePreviewSection = document.getElementById('invoice-preview-section');
    const printInvoiceBtn = document.getElementById('print-invoice');
    const exportPdfBtn = document.getElementById('export-pdf');
    const subtotalEl = document.getElementById('subtotal');
    const discountInput = document.getElementById('discount');
    const discountDisplay = document.getElementById('discount-display');
    const deliveryInput = document.getElementById('delivery-charge');
    const deliveryDisplay = document.getElementById('delivery-display');
    const grandTotalEl = document.getElementById('grand-total');
    const successMessage = document.getElementById('success-message');
    const closeSuccessBtn = document.getElementById('close-success');

    // Shop logo preview
    shopLogoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoPreview.src = event.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Load shop settings if they exist
    function loadShopSettings() {
        const shopInfo = JSON.parse(localStorage.getItem('shopInfo')) || {};
        document.getElementById('shop-name').value = shopInfo.name || '';
        document.getElementById('shop-address').value = shopInfo.address || '';
        document.getElementById('shop-message').value = shopInfo.message || '';
        
        if (shopInfo.logo) {
            logoPreview.src = shopInfo.logo;
            logoPreview.style.display = 'block';
        }
    }

    // Save shop settings
    shopSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shopInfo = {
            name: document.getElementById('shop-name').value,
            address: document.getElementById('shop-address').value,
            message: document.getElementById('shop-message').value,
            logo: logoPreview.src !== '#' ? logoPreview.src : ''
        };
        
        localStorage.setItem('shopInfo', JSON.stringify(shopInfo));
        showSuccessMessage('দোকানের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
    });

    // Reset shop settings
    resetSettingsBtn.addEventListener('click', function() {
        if (confirm('আপনি কি নিশ্চিত যে আপনি সব দোকান সেটিংস রিসেট করতে চান?')) {
            localStorage.removeItem('shopInfo');
            shopSettingsForm.reset();
            logoPreview.src = '#';
            logoPreview.style.display = 'none';
        }
    });

    // Set current date as default
    function setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
    }

    // Generate invoice number
    function generateInvoiceNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000);
        const invoiceNumber = `INV-${year}${month}${day}-${randomNum}`;
        document.getElementById('invoice-number').value = invoiceNumber;
    }

    // Add product row
    function addProductRow(product = { name: '', quantity: 1, price: 0 }) {
        const row = document.createElement('tr');
        row.className = 'product-row';
        
        row.innerHTML = `
            <td>
                <input type="text" class="product-name" value="${product.name}" required>
            </td>
            <td>
                <input type="number" min="1" class="product-quantity" value="${product.quantity}" required>
            </td>
            <td>
                <input type="number" min="0" step="0.01" class="product-price" value="${product.price}" required>
            </td>
            <td class="product-total">৳০.০০</td>
            <td class="text-right">
                <button type="button" class="delete-product">মুছুন</button>
            </td>
        `;
        
        productTable.appendChild(row);
        
        // Add event listeners for calculations
        const quantityInput = row.querySelector('.product-quantity');
        const priceInput = row.querySelector('.product-price');
        const totalCell = row.querySelector('.product-total');
        
        const calculateRowTotal = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            totalCell.textContent = `৳${total.toFixed(2)}`;
            calculateGrandTotal();
        };
        
        quantityInput.addEventListener('input', calculateRowTotal);
        priceInput.addEventListener('input', calculateRowTotal);
        
        // Add delete button event
        row.querySelector('.delete-product').addEventListener('click', function() {
            row.remove();
            calculateGrandTotal();
        });
        
        // Calculate initial total
        calculateRowTotal();
    }

    // Calculate grand total
    function calculateGrandTotal() {
        let subtotal = 0;
        document.querySelectorAll('.product-row').forEach(row => {
            const totalText = row.querySelector('.product-total').textContent;
            const total = parseFloat(totalText.replace('৳', '')) || 0;
            subtotal += total;
        });
        
        const discount = parseFloat(discountInput.value) || 0;
        const delivery = parseFloat(deliveryInput.value) || 0;
        const grandTotal = subtotal - discount + delivery;
        
        subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;
        discountDisplay.textContent = `৳${discount.toFixed(2)}`;
        deliveryDisplay.textContent = `৳${delivery.toFixed(2)}`;
        grandTotalEl.textContent = `৳${grandTotal.toFixed(2)}`;
    }

    // Discount and delivery charge events
    discountInput.addEventListener('input', calculateGrandTotal);
    deliveryInput.addEventListener('input', calculateGrandTotal);

    // Add product button
    addProductBtn.addEventListener('click', function() {
        addProductRow();
    });

    // Clear invoice form
    clearInvoiceBtn.addEventListener('click', function() {
        if (confirm('আপনি কি নিশ্চিত যে আপনি বর্তমান ইনভয়েস ক্লিয়ার করতে চান?')) {
            productTable.innerHTML = '';
            invoiceForm.reset();
            generateInvoiceNumber();
            setCurrentDate();
            subtotalEl.textContent = '৳০.০০';
            discountDisplay.textContent = '৳০.০০';
            deliveryDisplay.textContent = '৳০.০০';
            grandTotalEl.textContent = '৳০.০০';
            invoicePreviewSection.style.display = 'none';
        }
    });

    // Generate invoice
    generateInvoiceBtn.addEventListener('click', function() {
        // Form validation
        if (!invoiceForm.checkValidity()) {
            alert('দয়া করে সব আবশ্যক ফিল্ড পূরণ করুন।');
            return;
        }
        
        if (document.querySelectorAll('.product-row').length === 0) {
            alert('অন্তত একটি পণ্য যোগ করুন।');
            return;
        }
        
        const shopInfo = JSON.parse(localStorage.getItem('shopInfo')) || {};
        const invoiceType = document.getElementById('invoice-type').value;
        const invoiceNumber = document.getElementById('invoice-number').value;
        const invoiceDate = document.getElementById('invoice-date').value;
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        
        // Format date in Bengali
        const formattedDate = new Date(invoiceDate).toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Get products
        const products = [];
        document.querySelectorAll('.product-row').forEach(row => {
            products.push({
                name: row.querySelector('.product-name').value,
                quantity: row.querySelector('.product-quantity').value,
                price: parseFloat(row.querySelector('.product-price').value).toFixed(2),
                total: row.querySelector('.product-total').textContent
            });
        });
        
        // Get totals
        const subtotal = subtotalEl.textContent;
        const discount = discountDisplay.textContent;
        const delivery = deliveryDisplay.textContent;
        const grandTotal = grandTotalEl.textContent;
        
        // Custom message or default
        let customMessage = shopInfo.message || `ধন্যবাদ ${shopInfo.name || 'আমাদের দোকান'} এর সাথে থাকার জন্য।`;
        
        // Generate invoice HTML
        const invoiceHTML = `
            <div class="invoice-header">
                <div>
                    ${shopInfo.logo ? `<img src="${shopInfo.logo}" alt="${shopInfo.name}" class="logo-preview">` : ''}
                    <h1 class="invoice-title">${shopInfo.name || 'আপনার দোকানের নাম'}</h1>
                    <p>${shopInfo.address || 'আপনার দোকানের ঠিকানা'}</p>
                </div>
                <div class="invoice-meta">
                    <h2 class="invoice-title">${invoiceType === 'sell' ? 'বিক্রয় ইনভয়েস' : 'ক্রয় ইনভয়েস'}</h2>
                    <p><strong>ইনভয়েস নং:</strong> ${invoiceNumber}</p>
                    <p><strong>তারিখ:</strong> ${formattedDate}</p>
                </div>
            </div>
            
            <div class="invoice-body">
                <div class="customer-info">
                    <p><strong>${invoiceType === 'sell' ? 'ক্রেতার নাম:' : 'প্রদানকারীর নাম:'}</strong> ${customerName}</p>
                    ${customerPhone ? `<p><strong>ফোন নম্বর:</strong> ${customerPhone}</p>` : ''}
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>পণ্যের নাম</th>
                            <th>পরিমাণ</th>
                            <th>দর</th>
                            <th>মোট</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>৳${product.price}</td>
                                <td>${product.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <div>
                        <span>সাবটোটাল:</span>
                        <span>${subtotal}</span>
                    </div>
                    <div>
                        <span>ডিসকাউন্ট:</span>
                        <span>${discount}</span>
                    </div>
                    <div>
                        <span>ডেলিভারি চার্জ:</span>
                        <span>${delivery}</span>
                    </div>
                    <div class="grand-total">
                        <span>সর্বমোট:</span>
                        <span>${grandTotal}</span>
                    </div>
                </div>
            </div>
            
            <div class="invoice-footer">
                <div class="invoice-message">
                    <p>${customMessage}</p>
                </div>
                <div class="signature">
                    স্বাক্ষর
                </div>
            </div>
        `;
        
        document.getElementById('invoice-print').innerHTML = invoiceHTML;
        invoicePreviewSection.style.display = 'block';
        showSuccessMessage('ইনভয়েস সফলভাবে তৈরি করা হয়েছে!');
        
        // Scroll to preview
        invoicePreviewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Show success message
    function showSuccessMessage(message) {
        if (message) {
            successMessage.querySelector('h3').textContent = message;
        }
        successMessage.style.display = 'flex';
    }

    // Close success message
    closeSuccessBtn.addEventListener('click', function() {
        successMessage.style.display = 'none';
    });

    // Print invoice
    printInvoiceBtn.addEventListener('click', function() {
        window.print();
    });

    // Export PDF
    exportPdfBtn.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const element = document.getElementById('invoice-print');
        
        html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; // A4 width in mm (with margins)
            const pageHeight = 277; // A4 height in mm (with margins)
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Center the invoice on the page
            const position = 10; // Top margin
            
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            pdf.save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
        });
    });

    // Initialize
    loadShopSettings();
    addProductRow(); // Add one empty product row by default
    generateInvoiceNumber();
    setCurrentDate();
});