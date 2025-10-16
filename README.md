# Candidate Management App

Đây là một dự án ứng dụng web full-stack nhỏ giúp quản lý hồ sơ ứng viên. Dự án được xây dựng nhằm mục đích hoàn thành bài kiểm tra kỹ thuật, thể hiện khả năng làm việc với stack công nghệ React và Supabase.

## ✨ Các tính năng chính

*   **Xác thực người dùng:** Đăng ký, đăng nhập và đăng xuất an toàn sử dụng Supabase Auth.
*   **Bảo mật dữ liệu:** Áp dụng Row-Level Security (RLS) để đảm bảo mỗi nhân viên HR chỉ có thể xem và quản lý các ứng viên do chính họ tạo ra.
*   **Quản lý ứng viên (CRUD):**
    *   Hiển thị danh sách ứng viên dưới dạng bảng rõ ràng.
    *   Thêm ứng viên mới kèm theo CV (định dạng PDF).
    *   Cập nhật trạng thái của ứng viên (New, Interviewing, Hired, Rejected).
*   **Cập nhật thời gian thực (Realtime):** Bảng danh sách ứng viên sẽ tự động cập nhật cho tất-cả-các-phiên-làm-việc-đang-mở khi có bất kỳ thay đổi nào (thêm, cập nhật) mà không cần tải lại trang.
*   **Lưu trữ file an toàn:** Sử dụng Supabase Storage để lưu trữ các file CV, với chính sách bảo mật chỉ cho phép người dùng đã đăng nhập được upload.
*   **Xử lý Logic Backend:** Sử dụng Supabase Edge Functions để xử lý logic thêm ứng viên một cách an toàn và hiệu quả.
*   **Thông báo hệ thống:** Sử dụng `react-hot-toast` để cung cấp phản hồi tức thì và thân thiện cho người dùng.

---

## 🚀 Các yêu cầu nâng cao đã hoàn thành

### 1. Upload song song có giới hạn (Batch Upload with Concurrency Limit)
*   Ứng dụng cho phép người dùng chọn và upload **nhiều file CV cùng lúc**.
*   Để tối ưu hiệu năng và tránh làm quá tải trình duyệt, thuật toán được thiết kế để chỉ upload **tối đa 3 file song song** tại một thời điểm. Khi một file trong lô hoàn thành, file tiếp theo trong hàng đợi sẽ được bắt đầu.

### 2. Dashboard Thống kê (Analytics Dashboard)
*   Xây dựng một Edge Function `/analytics` chuyên dụng để tổng hợp và tính toán dữ liệu.
*   Giao diện hiển thị các thông số trực quan cho người dùng, bao gồm:
    *   Tổng số ứng viên.
    *   Số lượng ứng viên mới trong 7 ngày gần nhất.
    *   Top 3 vị trí có nhiều ứng viên nhất.
    *   Phân phối tỷ lệ phần trăm của các trạng thái ứng viên (New, Interviewing, Hired...).

---

## 🛠️ Công nghệ sử dụng

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend & Database:** Supabase
    *   **Auth:** Quản lý người dùng.
    *   **Database (PostgreSQL):** Lưu trữ dữ liệu ứng viên.
    *   **Storage:** Lưu trữ file CV.
    *   **Edge Functions (Deno):** Xử lý logic backend.
    *   **Realtime:** Đồng bộ dữ liệu real-time.

---

## 🏃 Hướng dẫn cài đặt và chạy dự án

Việc cài đặt đã được đơn giản hóa tối đa để có thể kiểm tra nhanh chóng.

1.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```

2.  **Chạy dự án:**
    ```bash
    npm run dev
    ```

3.  Mở trình duyệt và truy cập vào `http://localhost:5173`.

> **Lưu ý quan trọng:** File `.env.local` chứa các khóa API của Supabase **đã được đưa sẵn vào repository** này để thuận tiện cho việc kiểm tra. Trong một dự án thực tế, file này sẽ được thêm vào `.gitignore` để đảm bảo an toàn.
