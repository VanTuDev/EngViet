"use client";

import { createContext, useContext } from "react";

/**
 * `true` khi thanh bên desktop đang thu gọn. `Sidebar` bọc `ctaSlot` (vd nút
 * "Tạo lớp mới" của giáo viên) trong provider này để nút tự rút gọn thành nút
 * biểu tượng khi thanh bên thu gọn, thay vì tràn ra ngoài.
 */
export const SidebarCollapsedContext = createContext(false);

export const useSidebarCollapsedContext = () => useContext(SidebarCollapsedContext);
