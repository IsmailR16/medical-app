"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconHistory,
  IconChartBar,
  IconCreditCard,
  IconSettings,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Översikt", href: "/dashboard", icon: IconLayoutDashboard },
  { title: "Fallbibliotek", href: "/cases", icon: IconStethoscope },
  { title: "Sessioner", href: "/sessions", icon: IconHistory },
  { title: "Utvärderingar", href: "/evaluations", icon: IconChartBar },
  { title: "Abonnemang", href: "/billing", icon: IconCreditCard },
  { title: "Inställningar", href: "/settings", icon: IconSettings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
