/** Khoá localStorage lưu lựa chọn giao diện của người dùng. */
export const THEME_STORAGE_KEY = "topti-theme";

export type ThemePreference = "system" | "light" | "dark";

/**
 * Script chạy TRƯỚC khi paint (nhúng inline trong <head>) để đặt class `.dark`
 * ngay từ đầu, tránh nháy sáng. Đọc lựa chọn đã lưu; nếu là "system" thì theo
 * `prefers-color-scheme`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k='${THEME_STORAGE_KEY}';var p=localStorage.getItem(k)||'system';
var dark=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',dark);
}catch(e){}})();`;
