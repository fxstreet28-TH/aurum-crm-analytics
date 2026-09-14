export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_events: {
        Row: {
          creator_id: string | null
          details_json: Json
          id: string
          note: string | null
          resolved_at: string | null
          resolved_by: string | null
          rule_id: string | null
          severity: string
          status: string
          triggered_at: string
        }
        Insert: {
          creator_id?: string | null
          details_json?: Json
          id?: string
          note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity?: string
          status?: string
          triggered_at?: string
        }
        Update: {
          creator_id?: string | null
          details_json?: Json
          id?: string
          note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity?: string
          status?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          channels: string[]
          condition_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          id: string
          last_triggered_at: string | null
          name: string
          severity: string
          threshold_period: string
          triggered_count: number
          updated_at: string
        }
        Insert: {
          channels?: string[]
          condition_json: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name: string
          severity?: string
          threshold_period?: string
          triggered_count?: number
          updated_at?: string
        }
        Update: {
          channels?: string[]
          condition_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name?: string
          severity?: string
          threshold_period?: string
          triggered_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          key: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          key: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      buyback_requests: {
        Row: {
          admin_notes: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string
          star_amount: number
          status: string
          thb_per_star: number
          total_thb: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          star_amount: number
          status?: string
          thb_per_star?: number
          total_thb: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          star_amount?: number
          status?: string
          thb_per_star?: number
          total_thb?: number
          user_id?: string
        }
        Relationships: []
      }
      content_tier_limits: {
        Row: {
          can_ppv: boolean
          can_record_live: boolean
          can_upload_long_form: boolean
          can_upload_shorts: boolean
          created_at: string
          display_name: string
          live_recording_retention_days: number | null
          max_concurrent_viewers: number
          max_live_hours_per_day: number
          max_live_quality: string
          max_video_length_minutes: number
          max_video_quality: string
          max_videos_per_month: number
          monthly_price_thb: number
          storage_quota_gb: number
          tier: string
          updated_at: string
        }
        Insert: {
          can_ppv?: boolean
          can_record_live?: boolean
          can_upload_long_form?: boolean
          can_upload_shorts?: boolean
          created_at?: string
          display_name: string
          live_recording_retention_days?: number | null
          max_concurrent_viewers: number
          max_live_hours_per_day: number
          max_live_quality: string
          max_video_length_minutes: number
          max_video_quality: string
          max_videos_per_month: number
          monthly_price_thb?: number
          storage_quota_gb: number
          tier: string
          updated_at?: string
        }
        Update: {
          can_ppv?: boolean
          can_record_live?: boolean
          can_upload_long_form?: boolean
          can_upload_shorts?: boolean
          created_at?: string
          display_name?: string
          live_recording_retention_days?: number | null
          max_concurrent_viewers?: number
          max_live_hours_per_day?: number
          max_live_quality?: string
          max_video_length_minutes?: number
          max_video_quality?: string
          max_videos_per_month?: number
          monthly_price_thb?: number
          storage_quota_gb?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          creator_id: string
          id: string
          is_archived_creator: boolean | null
          is_archived_subscriber: boolean | null
          last_message_at: string | null
          subscriber_id: string
          unread_count_creator: number | null
          unread_count_subscriber: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          id?: string
          is_archived_creator?: boolean | null
          is_archived_subscriber?: boolean | null
          last_message_at?: string | null
          subscriber_id: string
          unread_count_creator?: number | null
          unread_count_subscriber?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          id?: string
          is_archived_creator?: boolean | null
          is_archived_subscriber?: boolean | null
          last_message_at?: string | null
          subscriber_id?: string
          unread_count_creator?: number | null
          unread_count_subscriber?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_content_quotas: {
        Row: {
          created_at: string
          creator_id: string
          estimated_cost_thb: number
          id: string
          live_delivery_gb: number
          live_minutes_used: number
          live_sessions_count: number
          month_key: string
          peak_concurrent_viewers: number
          status: string
          throttle_reason: string | null
          throttled_at: string | null
          tier: string
          total_storage_gb: number
          total_video_minutes_uploaded: number
          updated_at: string
          video_delivery_gb: number
          videos_uploaded_count: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          estimated_cost_thb?: number
          id?: string
          live_delivery_gb?: number
          live_minutes_used?: number
          live_sessions_count?: number
          month_key: string
          peak_concurrent_viewers?: number
          status?: string
          throttle_reason?: string | null
          throttled_at?: string | null
          tier: string
          total_storage_gb?: number
          total_video_minutes_uploaded?: number
          updated_at?: string
          video_delivery_gb?: number
          videos_uploaded_count?: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          estimated_cost_thb?: number
          id?: string
          live_delivery_gb?: number
          live_minutes_used?: number
          live_sessions_count?: number
          month_key?: string
          peak_concurrent_viewers?: number
          status?: string
          throttle_reason?: string | null
          throttled_at?: string | null
          tier?: string
          total_storage_gb?: number
          total_video_minutes_uploaded?: number
          updated_at?: string
          video_delivery_gb?: number
          videos_uploaded_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "creator_content_quotas_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_overlay_keys: {
        Row: {
          created_at: string
          creator_id: string
          overlay_key: string
          rotated_at: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          overlay_key: string
          rotated_at?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          overlay_key?: string
          rotated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_overlay_keys_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string
          cover_url: string | null
          created_at: string | null
          creator_id: string
          display_name: string
          handle: string
          is_public: boolean | null
          joined_at: string | null
          languages: string[] | null
          total_followers: number | null
          total_subscribers: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category: string
          cover_url?: string | null
          created_at?: string | null
          creator_id: string
          display_name: string
          handle: string
          is_public?: boolean | null
          joined_at?: string | null
          languages?: string[] | null
          total_followers?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string
          display_name?: string
          handle?: string
          is_public?: boolean | null
          joined_at?: string | null
          languages?: string[] | null
          total_followers?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tier_snapshots: {
        Row: {
          creator_id: string
          creator_net_stars: number
          creator_net_thb: number
          id: string
          month: number
          platform_cut_pct: number
          platform_cut_stars: number
          snapshot_at: string | null
          tier: number
          total_stars_received: number
          year: number
        }
        Insert: {
          creator_id: string
          creator_net_stars: number
          creator_net_thb: number
          id?: string
          month: number
          platform_cut_pct: number
          platform_cut_stars: number
          snapshot_at?: string | null
          tier: number
          total_stars_received: number
          year: number
        }
        Update: {
          creator_id?: string
          creator_net_stars?: number
          creator_net_thb?: number
          id?: string
          month?: number
          platform_cut_pct?: number
          platform_cut_stars?: number
          snapshot_at?: string | null
          tier?: number
          total_stars_received?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "creator_tier_snapshots_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          category: string | null
          content_tier: string
          content_tier_expires_at: string | null
          content_tier_started_at: string | null
          created_at: string
          customer_id: string | null
          display_name: string | null
          excluded_from_analytics: boolean
          handle: string | null
          id: string
          kyc_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          content_tier?: string
          content_tier_expires_at?: string | null
          content_tier_started_at?: string | null
          created_at?: string
          customer_id?: string | null
          display_name?: string | null
          excluded_from_analytics?: boolean
          handle?: string | null
          id?: string
          kyc_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          content_tier?: string
          content_tier_expires_at?: string | null
          content_tier_started_at?: string | null
          created_at?: string
          customer_id?: string | null
          display_name?: string | null
          excluded_from_analytics?: boolean
          handle?: string | null
          id?: string
          kyc_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          email_verified_at: string | null
          id: string
          phone: string | null
          phone_verified_at: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_verified_at?: string | null
          id?: string
          phone?: string | null
          phone_verified_at?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          email_verified_at?: string | null
          id?: string
          phone?: string | null
          phone_verified_at?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_codes: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          email: string
          expires_at: string
          id: string
          session_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          session_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          session_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_codes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "signup_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          event_type: string
          id: string
          payload: Json | null
          reference_id: string | null
          reference_type: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
          to_email: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          to_email: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          to_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feed_post_view_daily: {
        Row: {
          captured_at: string
          creator_id: string
          day: string
          post_id: string
          views_delta: number
          views_total: number
        }
        Insert: {
          captured_at?: string
          creator_id: string
          day: string
          post_id: string
          views_delta: number
          views_total: number
        }
        Update: {
          captured_at?: string
          creator_id?: string
          day?: string
          post_id?: string
          views_delta?: number
          views_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_view_daily_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_post_view_daily_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          access_level: string
          aspect_ratio: string | null
          comment_count: number
          content: string | null
          created_at: string | null
          creator_id: string
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          like_count: number
          live_session_id: string | null
          media_urls: string[] | null
          post_type: string
          ppv_post_id: string | null
          publish_status: string
          published_at: string | null
          scheduled_publish_at: string | null
          thumbnail_url: string | null
          tip_stars_received: number
          title: string | null
          video_provider: string | null
          video_status: string | null
          video_uid: string | null
          view_count: number
        }
        Insert: {
          access_level?: string
          aspect_ratio?: string | null
          comment_count?: number
          content?: string | null
          created_at?: string | null
          creator_id: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          like_count?: number
          live_session_id?: string | null
          media_urls?: string[] | null
          post_type?: string
          ppv_post_id?: string | null
          publish_status?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          thumbnail_url?: string | null
          tip_stars_received?: number
          title?: string | null
          video_provider?: string | null
          video_status?: string | null
          video_uid?: string | null
          view_count?: number
        }
        Update: {
          access_level?: string
          aspect_ratio?: string | null
          comment_count?: number
          content?: string | null
          created_at?: string | null
          creator_id?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          like_count?: number
          live_session_id?: string | null
          media_urls?: string[] | null
          post_type?: string
          ppv_post_id?: string | null
          publish_status?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          thumbnail_url?: string | null
          tip_stars_received?: number
          title?: string | null
          video_provider?: string | null
          video_status?: string | null
          video_uid?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_live_session_id_fkey"
            columns: ["live_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_ppv_post_id_fkey"
            columns: ["ppv_post_id"]
            isOneToOne: false
            referencedRelation: "ppv_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          id: string
          message: string
          page_url: string | null
          rating: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          id?: string
          message: string
          page_url?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          page_url?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          creator_id: string
          followed_at: string | null
          follower_id: string
          id: string
        }
        Insert: {
          creator_id: string
          followed_at?: string | null
          follower_id: string
          id?: string
        }
        Update: {
          creator_id?: string
          followed_at?: string | null
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_tiers: {
        Row: {
          animation_key: string
          created_at: string
          display_mode: string
          duration_ms: number
          id: number
          is_active: boolean
          max_quantity: number
          name_en: string
          name_th: string
          price_stars: number
          rarity: string
          slug: string
          sort_order: number
          subtitle_th: string | null
          updated_at: string
        }
        Insert: {
          animation_key: string
          created_at?: string
          display_mode?: string
          duration_ms?: number
          id: number
          is_active?: boolean
          max_quantity?: number
          name_en: string
          name_th: string
          price_stars: number
          rarity: string
          slug: string
          sort_order: number
          subtitle_th?: string | null
          updated_at?: string
        }
        Update: {
          animation_key?: string
          created_at?: string
          display_mode?: string
          duration_ms?: number
          id?: number
          is_active?: boolean
          max_quantity?: number
          name_en?: string
          name_th?: string
          price_stars?: number
          rarity?: string
          slug?: string
          sort_order?: number
          subtitle_th?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kyc_records: {
        Row: {
          address: string
          address_proof_url: string | null
          bank_account: Json | null
          creator_id: string
          date_of_birth: string
          full_name: string
          id: string
          id_document_type: string
          id_document_url: string
          nationality: string
          provider: string | null
          provider_reference_id: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          selfie_url: string
          status: string
          submitted_at: string | null
          verified_at: string | null
        }
        Insert: {
          address: string
          address_proof_url?: string | null
          bank_account?: Json | null
          creator_id: string
          date_of_birth: string
          full_name: string
          id?: string
          id_document_type: string
          id_document_url: string
          nationality: string
          provider?: string | null
          provider_reference_id?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          selfie_url: string
          status?: string
          submitted_at?: string | null
          verified_at?: string | null
        }
        Update: {
          address?: string
          address_proof_url?: string | null
          bank_account?: Json | null
          creator_id?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          id_document_type?: string
          id_document_url?: string
          nationality?: string
          provider?: string | null
          provider_reference_id?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          selfie_url?: string
          status?: string
          submitted_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_records_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      live_gifts: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          message: string | null
          quantity: number
          sender_id: string
          session_id: string
          stars_total: number
          tier_id: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          message?: string | null
          quantity: number
          sender_id: string
          session_id: string
          stars_total: number
          tier_id: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          message?: string | null
          quantity?: number
          sender_id?: string
          session_id?: string
          stars_total?: number
          tier_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_gifts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_gifts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_gifts_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "gift_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          access_level: string
          broadcast_quality: string | null
          bunny_ingest_url: string | null
          bunny_playback_url: string | null
          bunny_stream_id: string | null
          bunny_stream_key: string | null
          bunny_thumbnail_url: string | null
          chat_message_count: number
          cover_image_url: string | null
          created_at: string
          creator_id: string
          current_viewer_count: number
          description: string | null
          duration_seconds: number | null
          ended_at: string | null
          estimated_cost_thb: number | null
          gift_count: number
          gift_stars_total: number
          hls_playback_url: string | null
          id: string
          last_heartbeat_at: string | null
          latency_mode: string | null
          livekit_egress_id: string | null
          livekit_room_sid: string | null
          metadata: Json | null
          new_subscribers_from_live: number
          origin_room_id: string | null
          peak_viewer_count: number
          ppv_price_stars: number | null
          recording_enabled: boolean
          recording_feed_post_id: string | null
          recording_status: string | null
          recording_video_uid: string | null
          room_name: string
          scheduled_start_at: string | null
          started_at: string | null
          status: string
          tip_stars_received: number
          title: string
          total_viewer_minutes: number
          unique_viewer_count: number
          updated_at: string
          whip_publish_url: string | null
        }
        Insert: {
          access_level?: string
          broadcast_quality?: string | null
          bunny_ingest_url?: string | null
          bunny_playback_url?: string | null
          bunny_stream_id?: string | null
          bunny_stream_key?: string | null
          bunny_thumbnail_url?: string | null
          chat_message_count?: number
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          current_viewer_count?: number
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          estimated_cost_thb?: number | null
          gift_count?: number
          gift_stars_total?: number
          hls_playback_url?: string | null
          id?: string
          last_heartbeat_at?: string | null
          latency_mode?: string | null
          livekit_egress_id?: string | null
          livekit_room_sid?: string | null
          metadata?: Json | null
          new_subscribers_from_live?: number
          origin_room_id?: string | null
          peak_viewer_count?: number
          ppv_price_stars?: number | null
          recording_enabled?: boolean
          recording_feed_post_id?: string | null
          recording_status?: string | null
          recording_video_uid?: string | null
          room_name: string
          scheduled_start_at?: string | null
          started_at?: string | null
          status?: string
          tip_stars_received?: number
          title: string
          total_viewer_minutes?: number
          unique_viewer_count?: number
          updated_at?: string
          whip_publish_url?: string | null
        }
        Update: {
          access_level?: string
          broadcast_quality?: string | null
          bunny_ingest_url?: string | null
          bunny_playback_url?: string | null
          bunny_stream_id?: string | null
          bunny_stream_key?: string | null
          bunny_thumbnail_url?: string | null
          chat_message_count?: number
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          current_viewer_count?: number
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          estimated_cost_thb?: number | null
          gift_count?: number
          gift_stars_total?: number
          hls_playback_url?: string | null
          id?: string
          last_heartbeat_at?: string | null
          latency_mode?: string | null
          livekit_egress_id?: string | null
          livekit_room_sid?: string | null
          metadata?: Json | null
          new_subscribers_from_live?: number
          origin_room_id?: string | null
          peak_viewer_count?: number
          ppv_price_stars?: number | null
          recording_enabled?: boolean
          recording_feed_post_id?: string | null
          recording_status?: string | null
          recording_video_uid?: string | null
          room_name?: string
          scheduled_start_at?: string | null
          started_at?: string | null
          status?: string
          tip_stars_received?: number
          title?: string
          total_viewer_minutes?: number
          unique_viewer_count?: number
          updated_at?: string
          whip_publish_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_recording_feed_post_id_fkey"
            columns: ["recording_feed_post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_viewer_diagnostics: {
        Row: {
          attempt: number
          build_id: string | null
          client_id: string
          created_at: string
          delivery: string
          detail: Json | null
          elapsed_ms: number
          id: number
          outcome: string
          session_id: string
          step: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt?: number
          build_id?: string | null
          client_id: string
          created_at?: string
          delivery: string
          detail?: Json | null
          elapsed_ms?: number
          id?: number
          outcome: string
          session_id: string
          step: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt?: number
          build_id?: string | null
          client_id?: string
          created_at?: string
          delivery?: string
          detail?: Json | null
          elapsed_ms?: number
          id?: number
          outcome?: string
          session_id?: string
          step?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_viewer_diagnostics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          context: string
          created_at: string | null
          deleted_at: string | null
          duration_seconds: number | null
          filename: string | null
          height: number | null
          id: string
          is_deleted: boolean | null
          mime_type: string
          owner_id: string
          owner_type: string
          r2_key: string
          reference_id: string | null
          size_bytes: number
          width: number | null
        }
        Insert: {
          context: string
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          mime_type: string
          owner_id: string
          owner_type: string
          r2_key: string
          reference_id?: string | null
          size_bytes: number
          width?: number | null
        }
        Update: {
          context?: string
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          mime_type?: string
          owner_id?: string
          owner_type?: string
          r2_key?: string
          reference_id?: string | null
          size_bytes?: number
          width?: number | null
        }
        Relationships: []
      }
      message_purchases: {
        Row: {
          buyer_id: string
          creator_id: string
          id: string
          message_id: string
          price_stars_paid: number
          unlocked_at: string | null
        }
        Insert: {
          buyer_id: string
          creator_id: string
          id?: string
          message_id: string
          price_stars_paid: number
          unlocked_at?: string | null
        }
        Update: {
          buyer_id?: string
          creator_id?: string
          id?: string
          message_id?: string
          price_stars_paid?: number
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_purchases_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_purchases_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_urls: string[] | null
          message_type: string
          price_stars: number | null
          read_at: string | null
          sender_id: string
          sender_role: string
          tip_stars: number | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          message_type: string
          price_stars?: number | null
          read_at?: string | null
          sender_id: string
          sender_role: string
          tip_stars?: number | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          message_type?: string
          price_stars?: number | null
          read_at?: string | null
          sender_id?: string
          sender_role?: string
          tip_stars?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          created_at: string | null
          creator_id: string
          failure_reason: string | null
          hold_reason: string | null
          id: string
          payout_details: Json | null
          payout_method: string
          processed_at: string | null
          provider_transaction_id: string | null
          scheduled_for: string
          stars_amount: number
          status: string
          thb_amount: number
          tier_snapshot_id: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          failure_reason?: string | null
          hold_reason?: string | null
          id?: string
          payout_details?: Json | null
          payout_method: string
          processed_at?: string | null
          provider_transaction_id?: string | null
          scheduled_for: string
          stars_amount: number
          status?: string
          thb_amount: number
          tier_snapshot_id: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          failure_reason?: string | null
          hold_reason?: string | null
          id?: string
          payout_details?: Json | null
          payout_method?: string
          processed_at?: string | null
          provider_transaction_id?: string | null
          scheduled_for?: string
          stars_amount?: number
          status?: string
          thb_amount?: number
          tier_snapshot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_tier_snapshot_id_fkey"
            columns: ["tier_snapshot_id"]
            isOneToOne: false
            referencedRelation: "creator_tier_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          session_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          session_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          session_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_otps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "signup_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_budget_state: {
        Row: {
          actions_log: Json
          bunny_live_cost_thb: number
          bunny_storage_cost_thb: number
          bunny_stream_cost_thb: number
          created_at: string
          degrade_threshold_pct: number
          emergency_threshold_pct: number
          id: string
          last_bunny_sync_at: string | null
          last_livekit_sync_at: string | null
          livekit_cost_thb: number
          month_key: string
          monthly_budget_thb: number
          status: string
          status_change_reason: string | null
          status_changed_at: string | null
          total_spent_thb: number
          updated_at: string
          warning_threshold_pct: number
        }
        Insert: {
          actions_log?: Json
          bunny_live_cost_thb?: number
          bunny_storage_cost_thb?: number
          bunny_stream_cost_thb?: number
          created_at?: string
          degrade_threshold_pct?: number
          emergency_threshold_pct?: number
          id?: string
          last_bunny_sync_at?: string | null
          last_livekit_sync_at?: string | null
          livekit_cost_thb?: number
          month_key: string
          monthly_budget_thb?: number
          status?: string
          status_change_reason?: string | null
          status_changed_at?: string | null
          total_spent_thb?: number
          updated_at?: string
          warning_threshold_pct?: number
        }
        Update: {
          actions_log?: Json
          bunny_live_cost_thb?: number
          bunny_storage_cost_thb?: number
          bunny_stream_cost_thb?: number
          created_at?: string
          degrade_threshold_pct?: number
          emergency_threshold_pct?: number
          id?: string
          last_bunny_sync_at?: string | null
          last_livekit_sync_at?: string | null
          livekit_cost_thb?: number
          month_key?: string
          monthly_budget_thb?: number
          status?: string
          status_change_reason?: string | null
          status_changed_at?: string | null
          total_spent_thb?: number
          updated_at?: string
          warning_threshold_pct?: number
        }
        Relationships: []
      }
      ppv_posts: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_published: boolean | null
          media_type: string
          media_urls: string[]
          preview_url: string | null
          price_stars: number | null
          price_thb: number
          published_at: string | null
          title: string | null
          total_unlocks: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          media_type: string
          media_urls: string[]
          preview_url?: string | null
          price_stars?: number | null
          price_thb: number
          published_at?: string | null
          title?: string | null
          total_unlocks?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          media_type?: string
          media_urls?: string[]
          preview_url?: string | null
          price_stars?: number | null
          price_thb?: number
          published_at?: string | null
          title?: string | null
          total_unlocks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppv_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      ppv_unlocks: {
        Row: {
          creator_id: string
          id: string
          post_id: string
          price_stars_paid: number
          subscriber_id: string
          unlocked_at: string | null
        }
        Insert: {
          creator_id: string
          id?: string
          post_id: string
          price_stars_paid: number
          subscriber_id: string
          unlocked_at?: string | null
        }
        Update: {
          creator_id?: string
          id?: string
          post_id?: string
          price_stars_paid?: number
          subscriber_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppv_unlocks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ppv_unlocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "ppv_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          must_change_pw: boolean
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          must_change_pw?: boolean
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          must_change_pw?: boolean
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      signup_sessions: {
        Row: {
          created_at: string
          email: string
          email_verified_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          password_encrypted: string
          phone: string
          phone_verified_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_verified_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          password_encrypted: string
          phone: string
          phone_verified_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_verified_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          password_encrypted?: string
          phone?: string
          phone_verified_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      star_buybacks: {
        Row: {
          created_at: string | null
          id: string
          payout_details: Json | null
          payout_method: string
          processed_at: string | null
          rejection_reason: string | null
          stars_amount: number
          status: string
          thb_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payout_details?: Json | null
          payout_method: string
          processed_at?: string | null
          rejection_reason?: string | null
          stars_amount: number
          status?: string
          thb_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payout_details?: Json | null
          payout_method?: string
          processed_at?: string | null
          rejection_reason?: string | null
          stars_amount?: number
          status?: string
          thb_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      star_payment_intents: {
        Row: {
          amount_satang: number
          amount_thb: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          internal_thb_per_star: number
          paid_at: string | null
          pricing_config_id: string | null
          retail_thb_per_star: number
          source: string
          star_purchase_id: string | null
          stars: number
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_satang: number
          amount_thb: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          internal_thb_per_star?: number
          paid_at?: string | null
          pricing_config_id?: string | null
          retail_thb_per_star: number
          source?: string
          star_purchase_id?: string | null
          stars: number
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_satang?: number
          amount_thb?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          internal_thb_per_star?: number
          paid_at?: string | null
          pricing_config_id?: string | null
          retail_thb_per_star?: number
          source?: string
          star_purchase_id?: string | null
          stars?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "star_payment_intents_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "star_pricing_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "star_payment_intents_star_purchase_id_fkey"
            columns: ["star_purchase_id"]
            isOneToOne: false
            referencedRelation: "manual_credits_log"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "star_payment_intents_star_purchase_id_fkey"
            columns: ["star_purchase_id"]
            isOneToOne: false
            referencedRelation: "star_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      star_pricing_config: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          internal_thb_per_star: number
          is_active: boolean
          label: string
          notes: string | null
          retail_thb_per_star: number
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          internal_thb_per_star?: number
          is_active?: boolean
          label: string
          notes?: string | null
          retail_thb_per_star: number
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          internal_thb_per_star?: number
          is_active?: boolean
          label?: string
          notes?: string | null
          retail_thb_per_star?: number
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      star_purchases: {
        Row: {
          completed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          metadata: Json | null
          payment_method: string
          payment_provider_id: string
          payment_status: string
          remaining_stars: number | null
          retail_thb_per_star: number | null
          stars_amount: number
          thb_amount: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          metadata?: Json | null
          payment_method: string
          payment_provider_id: string
          payment_status: string
          remaining_stars?: number | null
          retail_thb_per_star?: number | null
          stars_amount: number
          thb_amount: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          payment_method?: string
          payment_provider_id?: string
          payment_status?: string
          remaining_stars?: number | null
          retail_thb_per_star?: number | null
          stars_amount?: number
          thb_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      star_transactions: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          purchase_batch_ids: string[] | null
          reference_id: string | null
          reference_type: string | null
          stars_delta: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          purchase_batch_ids?: string[] | null
          reference_id?: string | null
          reference_type?: string | null
          stars_delta: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          purchase_batch_ids?: string[] | null
          reference_id?: string | null
          reference_type?: string | null
          stars_delta?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "star_transactions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      stars_wallet: {
        Row: {
          total_balance: number
          total_bought_back: number
          total_expired: number
          total_purchased: number
          total_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          total_balance?: number
          total_bought_back?: number
          total_expired?: number
          total_purchased?: number
          total_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          total_balance?: number
          total_bought_back?: number
          total_expired?: number
          total_purchased?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          event_id: string
          event_type: string
          livemode: boolean
          payload: Json
          processed_at: string
          processing_result: Json | null
          processing_status: string
        }
        Insert: {
          event_id: string
          event_type: string
          livemode: boolean
          payload: Json
          processed_at?: string
          processing_result?: Json | null
          processing_status?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          livemode?: boolean
          payload?: Json
          processed_at?: string
          processing_result?: Json | null
          processing_status?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_stars: number | null
          price_thb: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_stars?: number | null
          price_thb: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_stars?: number | null
          price_thb?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          cancelled_at: string | null
          created_at: string | null
          creator_id: string
          expires_at: string
          grace_period_starts_at: string | null
          id: string
          plan_id: string
          price_stars: number
          price_thb: number
          starts_at: string
          status: string
          subscriber_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          creator_id: string
          expires_at: string
          grace_period_starts_at?: string | null
          id?: string
          plan_id: string
          price_stars: number
          price_thb: number
          starts_at?: string
          status?: string
          subscriber_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          creator_id?: string
          expires_at?: string
          grace_period_starts_at?: string | null
          id?: string
          plan_id?: string
          price_stars?: number
          price_thb?: number
          starts_at?: string
          status?: string
          subscriber_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      manual_credits_log: {
        Row: {
          admin_email: string | null
          admin_id: string | null
          credited_at: string | null
          customer_email: string | null
          customer_user_id: string | null
          expires_at: string | null
          purchase_id: string | null
          reason: string | null
          reference_purchase_id: string | null
          slip_image_path: string | null
          slip_qr_data: Json | null
          stars_credited: number | null
        }
        Relationships: []
      }
      platform_status_public: {
        Row: {
          month_key: string | null
          status: string | null
          status_changed_at: string | null
          status_message_th: string | null
        }
        Insert: {
          month_key?: string | null
          status?: string | null
          status_changed_at?: string | null
          status_message_th?: never
        }
        Update: {
          month_key?: string | null
          status?: string | null
          status_changed_at?: string | null
          status_message_th?: never
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_buyback: {
        Args: {
          p_admin_notes?: string
          p_bank_account_name: string
          p_bank_account_number: string
          p_bank_name: string
          p_star_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      admin_credit_stars: {
        Args: {
          p_reason: string
          p_reference_purchase_id?: string
          p_slip_image_path?: string
          p_slip_qr_data?: Json
          p_stars: number
          p_user_id: string
        }
        Returns: Json
      }
      admin_find_user_by_email: { Args: { p_email: string }; Returns: string }
      admin_get_buyback: { Args: { p_request_id: string }; Returns: Json }
      admin_list_buybacks: {
        Args: { p_search?: string; p_status?: string }
        Returns: Json
      }
      admin_refund_buyback: {
        Args: {
          p_admin_notes?: string
          p_new_status: string
          p_rejection_reason: string
          p_request_id: string
        }
        Returns: Json
      }
      admin_search_buyback_customers: {
        Args: { p_search: string }
        Returns: Json
      }
      admin_transition_buyback_status: {
        Args: {
          p_admin_notes?: string
          p_new_status: string
          p_request_id: string
        }
        Returns: Json
      }
      admin_update_buyback_notes: {
        Args: { p_admin_notes: string; p_request_id: string }
        Returns: Json
      }
      can_watch_live_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      check_creator_can_golive: {
        Args: { p_creator_id: string }
        Returns: {
          can_golive: boolean
          hours_remaining_today: number
          max_quality: string
          max_viewers: number
          reason: string
        }[]
      }
      check_creator_can_upload: {
        Args: {
          p_creator_id: string
          p_video_duration_minutes?: number
          p_video_type?: string
        }
        Returns: {
          can_upload: boolean
          quota_details: Json
          quota_used_pct: number
          reason: string
        }[]
      }
      check_feedback_rate_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_slip_duplicate: { Args: { p_qr_payload: string }; Returns: Json }
      close_long_abandoned_live_sessions: { Args: never; Returns: number }
      count_active_live_sessions: { Args: never; Returns: number }
      credit_stars_purchase: {
        Args: {
          p_metadata?: Json
          p_payment_method: string
          p_payment_provider_id: string
          p_stars: number
          p_thb: number
          p_user_id: string
        }
        Returns: Json
      }
      crm_append_note: {
        Args: { p_existing: string; p_label: string; p_new: string }
        Returns: string
      }
      crm_assert_admin: { Args: never; Returns: string }
      crm_internal_star_thb: { Args: never; Returns: number }
      crm_month_start: { Args: { p_month?: string }; Returns: string }
      crm_tier_next_threshold: { Args: { p_stars: number }; Returns: number }
      crm_tier_of: { Args: { p_stars: number }; Returns: number }
      crm_tier_pct: { Args: { p_stars: number }; Returns: number }
      current_month_key: { Args: never; Returns: string }
      deduct_stars_fifo: {
        Args: {
          p_creator_id?: string
          p_reference_id?: string
          p_reference_type?: string
          p_stars: number
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      evaluate_alert_rules: {
        Args: never
        Returns: {
          channels: string[]
          creator_id: string
          details: Json
          display_name: string
          event_id: string
          handle: string
          rule_id: string
          rule_name: string
          severity: string
        }[]
      }
      expire_star_batches: { Args: never; Returns: Json }
      fetch_admin_notification_email: { Args: never; Returns: string }
      fetch_star_stats_email: { Args: never; Returns: string }
      generate_overlay_key: { Args: never; Returns: string }
      get_creator_cost_breakdown: {
        Args: { p_creator_id: string; p_month?: string }
        Returns: Json
      }
      get_creator_current_tier: {
        Args: { p_creator_id: string; p_month?: string }
        Returns: Json
      }
      get_creator_leaderboard: {
        Args: {
          p_include_excluded?: boolean
          p_limit?: number
          p_month?: string
          p_offset?: number
          p_sort?: string
        }
        Returns: {
          creator_id: string
          creator_thb: number
          display_name: string
          excluded_from_analytics: boolean
          handle: string
          live_cost_thb: number
          live_hours: number
          margin_pct: number
          platform_thb: number
          playback_cost_thb: number
          profit_thb: number
          sessions_count: number
          stars: number
          storage_cost_thb: number
          tier: number
          tier_pct: number
          total_cost_thb: number
          total_rows: number
        }[]
      }
      get_creator_overlay_key: {
        Args: { p_regenerate?: boolean }
        Returns: string
      }
      get_creator_view_trend: {
        Args: { p_creator_id: string; p_days?: number }
        Returns: {
          day: string
          has_history: boolean
          views: number
          views_total: number
        }[]
      }
      get_daily_revenue_trend: {
        Args: { p_days?: number }
        Returns: {
          cost_thb: number
          day: string
          profit_thb: number
          revenue_thb: number
          stars: number
        }[]
      }
      get_feedback_stats: { Args: never; Returns: Json }
      get_manual_credits_log: {
        Args: { p_limit?: number }
        Returns: {
          admin_email: string | null
          admin_id: string | null
          credited_at: string | null
          customer_email: string | null
          customer_user_id: string | null
          expires_at: string | null
          purchase_id: string | null
          reason: string | null
          reference_purchase_id: string | null
          slip_image_path: string | null
          slip_qr_data: Json | null
          stars_credited: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "manual_credits_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_or_create_creator_quota: {
        Args: { p_creator_id: string }
        Returns: {
          created_at: string
          creator_id: string
          estimated_cost_thb: number
          id: string
          live_delivery_gb: number
          live_minutes_used: number
          live_sessions_count: number
          month_key: string
          peak_concurrent_viewers: number
          status: string
          throttle_reason: string | null
          throttled_at: string | null
          tier: string
          total_storage_gb: number
          total_video_minutes_uploaded: number
          updated_at: string
          video_delivery_gb: number
          videos_uploaded_count: number
        }
        SetofOptions: {
          from: "*"
          to: "creator_content_quotas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_platform_revenue_summary: {
        Args: { p_month?: string }
        Returns: Json
      }
      get_star_purchase_slot_performance: {
        Args: { p_month?: string }
        Returns: {
          internal_thb: number
          markup_per_order: number
          orders_count: number
          retail_thb: number
          slot_label: string
          stars_per_slot: number
          stars_sold: number
          total_profit_thb: number
        }[]
      }
      get_vault_secret: { Args: { p_name: string }; Returns: string }
      get_vault_secrets: {
        Args: { p_names: string[] }
        Returns: {
          decrypted_secret: string
          name: string
        }[]
      }
      increment_like_count: {
        Args: { p_delta?: number; p_post_id: string }
        Returns: number
      }
      increment_tip_stars_received: {
        Args: { p_post_id: string; p_stars: number }
        Returns: number
      }
      increment_view_count: { Args: { p_post_id: string }; Returns: undefined }
      increment_wallet_balance: {
        Args: { p_stars: number; p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_crm_admin: { Args: never; Returns: boolean }
      list_discoverable_live_sessions: {
        Args: { p_limit?: number }
        Returns: {
          access_level: string
          cover_image_url: string
          creator_id: string
          current_viewer_count: number
          id: string
          is_locked: boolean
          room_name: string
          title: string
        }[]
      }
      live_session_id_from_topic: { Args: { p_topic: string }; Returns: string }
      live_watchdog_grace_seconds: { Args: never; Returns: number }
      log_live_viewer_diagnostic: {
        Args: {
          p_attempt?: number
          p_build_id?: string
          p_client_id: string
          p_delivery: string
          p_detail?: Json
          p_elapsed_ms?: number
          p_outcome: string
          p_session_id: string
          p_step: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      notify_admin_edge_function: {
        Args: { p_event_type: string; p_source_id: string }
        Returns: undefined
      }
      notify_email_edge_function: {
        Args: {
          p_event_type: string
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      request_buyback: {
        Args: {
          p_bank_account_name: string
          p_bank_account_number: string
          p_bank_name: string
          p_star_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      resolve_overlay_session: {
        Args: { p_overlay_key: string; p_session_id: string }
        Returns: string
      }
      run_alert_rules: { Args: never; Returns: undefined }
      run_live_watchdog: { Args: never; Returns: undefined }
      run_star_expiration_cycle: { Args: never; Returns: Json }
      search_customer_for_credit: {
        Args: { p_query: string }
        Returns: {
          email: string
          phone: string
          recent_failed_purchase_created_at: string
          recent_failed_purchase_id: string
          recent_failed_purchase_stars: number
          recent_failed_purchase_thb: number
          role: string
          signup_date: string
          total_purchased: number
          total_spent: number
          user_id: string
          wallet_balance: number
        }[]
      }
      send_live_gift: {
        Args: {
          p_message: string
          p_quantity: number
          p_sender_id: string
          p_session_id: string
          p_tier_id: number
        }
        Returns: {
          created_at: string
          creator_id: string
          id: string
          message: string | null
          quantity: number
          sender_id: string
          session_id: string
          stars_total: number
          tier_id: number
        }
        SetofOptions: {
          from: "*"
          to: "live_gifts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      server_now: { Args: never; Returns: string }
      set_live_viewer_counts: {
        Args: { p_current: number; p_session_id: string }
        Returns: undefined
      }
      snapshot_feed_post_views: { Args: { p_day?: string }; Returns: number }
      touch_live_heartbeat: { Args: { p_session_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
