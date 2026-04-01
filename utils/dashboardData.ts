"use server";

import { User } from "@/types";
import { getServerAppOrigin } from "@/utils/getServerAppOrigin";

export interface DashboardData {
  stats: {
    totalReservations: number;
    completedServices: number;
    pendingReservations: number;
    cancelledReservations: number;
    totalSpent: number;
    averageSpentPerService: number;
    thisMonthReservations: number;
    thisMonthSpent: number;
  };
  recentReservations: any[];
  topServices: any[];
}

export async function fetchDashboardData(user: User): Promise<DashboardData> {
  try {
    const phone =
      user.phoneNumber != null && String(user.phoneNumber).trim() !== ""
        ? String(user.phoneNumber)
        : "";
    if (!phone) {
      return {
        stats: {
          totalReservations: 0,
          completedServices: 0,
          pendingReservations: 0,
          cancelledReservations: 0,
          totalSpent: 0,
          averageSpentPerService: 0,
          thisMonthReservations: 0,
          thisMonthSpent: 0,
        },
        recentReservations: [],
        topServices: [],
      };
    }

    const origin = await getServerAppOrigin();
    const reservationsResponse = await fetch(
      `${origin}/api/reservations?phone=${encodeURIComponent(phone)}`,
      {
        cache: "no-store",
      }
    );

    if (!reservationsResponse.ok) {
      throw new Error("Failed to fetch reservations");
    }

    const userReservations = await reservationsResponse.json();

    // For now, we'll use mock prices since the reservation data doesn't include prices
    // In a real implementation, you'd want to store prices in reservations
    const mockPrices = [80, 60, 120, 50, 90]; // Mock prices for demo

    // Calculate statistics from real data
    const calculateStats = () => {
      const totalReservations = userReservations.length;
      const completedServices = userReservations.filter(
        (r: any) => r.status === "completed"
      ).length;
      const pendingReservations = userReservations.filter(
        (r: any) => r.status === "pending"
      ).length;
      const cancelledReservations = userReservations.filter(
        (r: any) => r.status === "cancelled"
      ).length;
      const totalSpent = userReservations.reduce((sum: number, r: any, index: number) => {
        return sum + (mockPrices[index % mockPrices.length] || 0);
      }, 0);
      
      const averageSpentPerService =
        totalReservations > 0 ? Math.round(totalSpent / totalReservations) : 0;

      // Calculate this month's data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthReservations = userReservations.filter((r: any) => {
        const reservationDate = new Date(r.createdAt);
        return (
          reservationDate.getMonth() === currentMonth &&
          reservationDate.getFullYear() === currentYear
        );
      });
      const thisMonthSpent = thisMonthReservations.reduce(
        (sum: number, r: any, index: number) => sum + (mockPrices[index % mockPrices.length] || 0),
        0
      );

      return {
        totalReservations,
        completedServices,
        pendingReservations,
        cancelledReservations,
        totalSpent,
        averageSpentPerService,
        thisMonthReservations: thisMonthReservations.length,
        thisMonthSpent,
      };
    };

    // Calculate top services from real data
    const calculateTopServices = () => {
      const serviceStats: Record<string, { count: number; totalSpent: number }> = {};

      userReservations.forEach((reservation: any, index: number) => {
        const serviceName = reservation.serviceName || "Unknown Service";
        const price = mockPrices[index % mockPrices.length] || 0;
        
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { count: 0, totalSpent: 0 };
        }
        serviceStats[serviceName].count++;
        serviceStats[serviceName].totalSpent += price;
      });

      return Object.entries(serviceStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          totalSpent: stats.totalSpent,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    };

    // Get recent reservations (last 5)
    const getRecentReservations = () => {
      return userReservations
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
    };

    return {
      stats: calculateStats(),
      recentReservations: getRecentReservations(),
      topServices: calculateTopServices(),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Return empty data structure on error
    return {
      stats: {
        totalReservations: 0,
        completedServices: 0,
        pendingReservations: 0,
        cancelledReservations: 0,
        totalSpent: 0,
        averageSpentPerService: 0,
        thisMonthReservations: 0,
        thisMonthSpent: 0,
      },
      recentReservations: [],
      topServices: [],
    };
  }
}
