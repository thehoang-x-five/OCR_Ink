const faqs = [
  { q: 'Ảnh chụp thế nào để OCR tốt?', a: 'Giữ ánh sáng đủ, không lóa, canh thẳng camera, tránh bóng và độ nghiêng. Độ phân giải tối thiểu 300 DPI.' },
  { q: 'Có hỗ trợ PDF nhiều trang?', a: 'Có, mock hiển thị danh sách trang và cho phép merge output.' },
  { q: 'Có thể xuất định dạng nào?', a: 'TXT, MD, JSON (structured), Searchable PDF (mock), DOCX.' },
];

const Help = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Help & FAQ</h1>
      <p className="text-muted-foreground">Tips for better OCR and common answers.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-border/70 bg-card/80 p-4">
        <h3 className="text-lg font-semibold">FAQs</h3>
        {faqs.map((item) => (
          <div key={item.q} className="rounded-lg border border-border/70 bg-muted/30 p-3">
            <p className="font-semibold text-foreground">{item.q}</p>
            <p className="text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-border/70 bg-card/80 p-4 text-sm">
        <h3 className="text-lg font-semibold">Photo tips</h3>
        <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
          <li>Dùng nền phẳng, tương phản.</li>
          <li>Tránh bóng, chụp vuông góc tài liệu.</li>
          <li>Bật Auto-orientation + Deskew trong Preprocess.</li>
          <li>Ưu tiên định dạng PNG/JPG rõ nét.</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Help;
