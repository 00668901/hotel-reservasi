package main

import (
	"fmt"
	"os" // PENTING: Tambahkan ini agar variabel PORT bisa terbaca

	"github.com/gin-gonic/gin"
	"github.com/supabase-community/supabase-go"
)

func main() {
	// 1. KONFIGURASI SUPABASE
	sbURL := "https://adtqycfhqwrbtxpddcqo.supabase.co"
	sbKey := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdHF5Y2ZocXdyYnR4cGRkY3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyNTM3MSwiZXhwIjoyMDc5MDAxMzcxfQ.WNclsUnzsItY10Zd-gPZDjw4si3eEfJifhf1ZR4tpV0"

	client, _ := supabase.NewClient(sbURL, sbKey, nil)

	// --- 2. FITUR OTOMATIS (AUTO-SEED) ---
	fmt.Println("Mengecek data kamar di database...")
	var checkResult []map[string]interface{}
	client.From("kv_store_aa71f191").Select("value", "exact", false).Eq("key", "rooms").ExecuteTo(&checkResult)

	if len(checkResult) == 0 {
		fmt.Println("Data kosong! Mengisi 6 kamar otomatis...")
		defaultRooms := []map[string]interface{}{
			{"id": "1", "name": "Deluxe Room", "type": "Deluxe", "price": 1200000, "capacity": 2, "description": "Kamar nyaman dengan king bed.", "amenities": []string{"WiFi", "AC", "TV"}, "available": true, "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"},
			{"id": "2", "name": "Family Suite", "type": "Suite", "price": 2500000, "capacity": 4, "description": "Cocok untuk keluarga besar.", "amenities": []string{"Kitchen", "WiFi", "Pool Access"}, "available": true, "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"},
			{"id": "3", "name": "Executive Room", "type": "Executive", "price": 1800000, "capacity": 2, "description": "Fasilitas lengkap untuk pebisnis.", "amenities": []string{"Work Desk", "Coffee Maker", "AC"}, "available": true, "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"},
			{"id": "4", "name": "Presidential Suite", "type": "Suite", "price": 5000000, "capacity": 4, "description": "Kemewahan tiada tara dengan private pool.", "amenities": []string{"Private Pool", "Butler", "WiFi"}, "available": true, "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f261?w=800"},
			{"id": "5", "name": "Standard Twin", "type": "Standard", "price": 800000, "capacity": 2, "description": "Pilihan hemat dengan fasilitas standar.", "amenities": []string{"Twin Bed", "WiFi", "TV"}, "available": true, "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"},
			{"id": "6", "name": "Penthouse Loft", "type": "Penthouse", "price": 7500000, "capacity": 6, "description": "Lantai teratas dengan pemandangan 360 derajat.", "amenities": []string{"Jacuzzi", "Sky Garden", "Mini Bar"}, "available": true, "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"},
		}
		client.From("kv_store_aa71f191").Insert(map[string]interface{}{"key": "rooms", "value": defaultRooms}, false, "", "", "").Execute()
		fmt.Println("Berhasil mengisi 6 kamar otomatis!")
	} else {
		fmt.Println("Data kamar sudah tersedia.")
	}

	r := gin.Default()

	// 3. MIDDLEWARE CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 4. ENDPOINTS
	r.GET("/api/rooms", func(c *gin.Context) {
		var result []map[string]interface{}
		client.From("kv_store_aa71f191").Select("value", "exact", false).Eq("key", "rooms").ExecuteTo(&result)
		if len(result) > 0 {
			c.JSON(200, result[0]["value"])
		} else {
			c.JSON(200, []interface{}{})
		}
	})

	r.GET("/api/reservations", func(c *gin.Context) {
		var result []map[string]interface{}
		client.From("kv_store_aa71f191").Select("value", "exact", false).Eq("key", "reservations").ExecuteTo(&result)
		if len(result) > 0 {
			c.JSON(200, result[0]["value"])
		} else {
			c.JSON(200, []interface{}{})
		}
	})

	r.POST("/api/signup", func(c *gin.Context) {
		c.JSON(200, gin.H{"success": true, "message": "Handle by Golang"})
	})

	// 5. RUN SERVER DENGAN PORT DINAMIS
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Server running on port:", port)
	r.Run(":" + port)
}
