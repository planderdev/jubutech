// Supabase 데이터베이스 타입 — 프로젝트 jubutech(khepqjkblymwzuufzull) 에서 생성 (2026-11-12, 0001~0005 적용 후, MCP generate_typescript_types).
// 마이그레이션을 바꾸면 다시 생성한다. 손으로 고치지 않는다.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          answers: Json
          campaign_id: string
          channel: Database["public"]["Enums"]["channel_type"]
          channel_url: string | null
          completed_at: string | null
          consent: Json
          created_at: string
          feedback: string | null
          id: string
          message: string | null
          profile_id: string
          selected_at: string | null
          shipping: Json | null
          status: Database["public"]["Enums"]["application_status"]
          submission_note: string | null
          submission_url: string | null
          submitted_at: string | null
        }
        Insert: {
          answers?: Json
          campaign_id: string
          channel: Database["public"]["Enums"]["channel_type"]
          channel_url?: string | null
          completed_at?: string | null
          consent?: Json
          created_at?: string
          feedback?: string | null
          id?: string
          message?: string | null
          profile_id: string
          selected_at?: string | null
          shipping?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          submission_note?: string | null
          submission_url?: string | null
          submitted_at?: string | null
        }
        Update: {
          answers?: Json
          campaign_id?: string
          channel?: Database["public"]["Enums"]["channel_type"]
          channel_url?: string | null
          completed_at?: string | null
          consent?: Json
          created_at?: string
          feedback?: string | null
          id?: string
          message?: string | null
          profile_id?: string
          selected_at?: string | null
          shipping?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          submission_note?: string | null
          submission_url?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json | null
          id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          post_id: string
          profile_id: string
        }
        Insert: {
          post_id: string
          profile_id: string
        }
        Update: {
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_ratings: {
        Row: {
          application_id: string
          campaign_id: string
          comment: string | null
          created_at: string
          id: string
          matched_guide: string
          profile_id: string
          shipped_on_time: string
          stars: number
          status: string
        }
        Insert: {
          application_id: string
          campaign_id: string
          comment?: string | null
          created_at?: string
          id?: string
          matched_guide: string
          profile_id: string
          shipped_on_time: string
          stars: number
          status?: string
        }
        Update: {
          application_id?: string
          campaign_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          matched_guide?: string
          profile_id?: string
          shipped_on_time?: string
          stars?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_ratings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_ratings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string
          announce_date: string
          announcement_at: string | null
          benefit: string | null
          benefit_value: number
          brand: string
          category: string
          channel_label: string | null
          channels: Database["public"]["Enums"]["channel_type"][]
          conditions: string | null
          created_at: string
          description: string | null
          exposure_end_at: string | null
          exposure_start_at: string | null
          id: string
          image: string | null
          keywords: string[]
          mission: Json
          mission_end: string | null
          mission_start: string | null
          missions: string[]
          publication_status: string
          questions: string[]
          recruit_count: number
          recruit_end: string
          recruit_start: string
          recruitment_end_at: string | null
          recruitment_start_at: string | null
          region: string | null
          requirements: string[]
          review_due_at: string | null
          review_note: string | null
          reviewed_at: string | null
          reward_desc: string
          reward_type: string
          reward_value: number
          selection_mode: string
          shipping: boolean
          status: Database["public"]["Enums"]["campaign_status"]
          thumb_icon: string | null
          thumb_url: string | null
          title: string
          views: number
        }
        Insert: {
          advertiser_id: string
          announce_date: string
          announcement_at?: string | null
          benefit?: string | null
          benefit_value?: number
          brand: string
          category: string
          channel_label?: string | null
          channels?: Database["public"]["Enums"]["channel_type"][]
          conditions?: string | null
          created_at?: string
          description?: string | null
          exposure_end_at?: string | null
          exposure_start_at?: string | null
          id?: string
          image?: string | null
          keywords?: string[]
          mission?: Json
          mission_end?: string | null
          mission_start?: string | null
          missions?: string[]
          publication_status?: string
          questions?: string[]
          recruit_count: number
          recruit_end: string
          recruit_start: string
          recruitment_end_at?: string | null
          recruitment_start_at?: string | null
          region?: string | null
          requirements?: string[]
          review_due_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reward_desc: string
          reward_type: string
          reward_value?: number
          selection_mode?: string
          shipping?: boolean
          status?: Database["public"]["Enums"]["campaign_status"]
          thumb_icon?: string | null
          thumb_url?: string | null
          title: string
          views?: number
        }
        Update: {
          advertiser_id?: string
          announce_date?: string
          announcement_at?: string | null
          benefit?: string | null
          benefit_value?: number
          brand?: string
          category?: string
          channel_label?: string | null
          channels?: Database["public"]["Enums"]["channel_type"][]
          conditions?: string | null
          created_at?: string
          description?: string | null
          exposure_end_at?: string | null
          exposure_start_at?: string | null
          id?: string
          image?: string | null
          keywords?: string[]
          mission?: Json
          mission_end?: string | null
          mission_start?: string | null
          missions?: string[]
          publication_status?: string
          questions?: string[]
          recruit_count?: number
          recruit_end?: string
          recruit_start?: string
          recruitment_end_at?: string | null
          recruitment_start_at?: string | null
          region?: string | null
          requirements?: string[]
          review_due_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reward_desc?: string
          reward_type?: string
          reward_value?: number
          selection_mode?: string
          shipping?: boolean
          status?: Database["public"]["Enums"]["campaign_status"]
          thumb_icon?: string | null
          thumb_url?: string | null
          title?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          status: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      info_articles: {
        Row: {
          amount: string | null
          apply_end_at: string | null
          body: string[]
          body_blocks: Json
          category: Database["public"]["Enums"]["info_category"]
          child_ages: string[]
          created_at: string
          deadline: string | null
          how_to: string[] | null
          icon: string | null
          id: string
          placement: string
          published_at: string | null
          region: string | null
          reward_points: number
          source: string
          source_date: string
          source_url: string | null
          status: string
          summary: string
          tags: string[]
          target: string | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          amount?: string | null
          apply_end_at?: string | null
          body?: string[]
          body_blocks?: Json
          category: Database["public"]["Enums"]["info_category"]
          child_ages?: string[]
          created_at?: string
          deadline?: string | null
          how_to?: string[] | null
          icon?: string | null
          id?: string
          placement?: string
          published_at?: string | null
          region?: string | null
          reward_points?: number
          source: string
          source_date: string
          source_url?: string | null
          status?: string
          summary: string
          tags?: string[]
          target?: string | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          amount?: string | null
          apply_end_at?: string | null
          body?: string[]
          body_blocks?: Json
          category?: Database["public"]["Enums"]["info_category"]
          child_ages?: string[]
          created_at?: string
          deadline?: string | null
          how_to?: string[] | null
          icon?: string | null
          id?: string
          placement?: string
          published_at?: string | null
          region?: string | null
          reward_points?: number
          source?: string
          source_date?: string
          source_url?: string | null
          status?: string
          summary?: string
          tags?: string[]
          target?: string | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: []
      }
      info_categories: {
        Row: {
          enabled: boolean
          icon: string
          id: Database["public"]["Enums"]["info_category"]
          name: string
          sort: number
        }
        Insert: {
          enabled?: boolean
          icon: string
          id: Database["public"]["Enums"]["info_category"]
          name: string
          sort: number
        }
        Update: {
          enabled?: boolean
          icon?: string
          id?: Database["public"]["Enums"]["info_category"]
          name?: string
          sort?: number
        }
        Relationships: []
      }
      info_saves: {
        Row: {
          article_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "info_saves_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "info_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "info_saves_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          answer: string | null
          body: string
          category: string
          created_at: string
          id: string
          profile_id: string
          status: string
        }
        Insert: {
          answer?: string | null
          body: string
          category: string
          created_at?: string
          id?: string
          profile_id: string
          status?: string
        }
        Update: {
          answer?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          owner_id: string
        }
        Insert: {
          code: string
          created_at?: string
          owner_id: string
        }
        Update: {
          code?: string
          created_at?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_uses: {
        Row: {
          code: string
          created_at: string
          profile_id: string
        }
        Insert: {
          code: string
          created_at?: string
          profile_id: string
        }
        Update: {
          code?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_uses_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "invite_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          checklist_answers: Json
          checklist_template_version: number
          created_at: string
          draft_status: string
          emotion: string | null
          fee: number
          id: string
          index_note: string | null
          intraday: string | null
          market: string
          profile_id: string
          quantity: number
          reason: string | null
          reflection: string | null
          resistance_note: string | null
          sell_review: string | null
          side: string
          stock_name: string | null
          stop_loss_price: number
          support_note: string | null
          symbol: string | null
          target_price: number
          tax: number
          trade_date: string
          trend_checks: Json
          unit_price: number
          updated_at: string
          volume_note: string | null
        }
        Insert: {
          checklist_answers?: Json
          checklist_template_version?: number
          created_at?: string
          draft_status?: string
          emotion?: string | null
          fee?: number
          id?: string
          index_note?: string | null
          intraday?: string | null
          market?: string
          profile_id: string
          quantity?: number
          reason?: string | null
          reflection?: string | null
          resistance_note?: string | null
          sell_review?: string | null
          side: string
          stock_name?: string | null
          stop_loss_price?: number
          support_note?: string | null
          symbol?: string | null
          target_price?: number
          tax?: number
          trade_date: string
          trend_checks?: Json
          unit_price?: number
          updated_at?: string
          volume_note?: string | null
        }
        Update: {
          checklist_answers?: Json
          checklist_template_version?: number
          created_at?: string
          draft_status?: string
          emotion?: string | null
          fee?: number
          id?: string
          index_note?: string | null
          intraday?: string | null
          market?: string
          profile_id?: string
          quantity?: number
          reason?: string | null
          reflection?: string | null
          resistance_note?: string | null
          sell_review?: string | null
          side?: string
          stock_name?: string | null
          stop_loss_price?: number
          support_note?: string | null
          symbol?: string | null
          target_price?: number
          tax?: number
          trade_date?: string
          trend_checks?: Json
          unit_price?: number
          updated_at?: string
          volume_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_goals: {
        Row: {
          month: string
          profile_id: string
          target_days: number
        }
        Insert: {
          month: string
          profile_id: string
          target_days: number
        }
        Update: {
          month?: string
          profile_id?: string
          target_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_goals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_words: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          id: string
          word: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          id?: string
          word: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_words_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          body: string
          created_at: string
          id: string
          pinned: boolean
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          pinned?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          href: string | null
          id: string
          profile_id: string
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          profile_id: string
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          profile_id?: string
          read?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notify_prefs: {
        Row: {
          profile_id: string
          review: boolean
          selection: boolean
          subsidy: boolean
        }
        Insert: {
          profile_id: string
          review?: boolean
          selection?: boolean
          subsidy?: boolean
        }
        Update: {
          profile_id?: string
          review?: boolean
          selection?: boolean
          subsidy?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notify_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_logs: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          profile_id: string
          reason: string
          ref_id: string | null
          ref_type: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: string
          profile_id: string
          reason: string
          ref_id?: string | null
          ref_type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          profile_id?: string
          reason?: string
          ref_id?: string | null
          ref_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          post_id: string
          profile_id: string
        }
        Insert: {
          post_id: string
          profile_id: string
        }
        Update: {
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          board: Database["public"]["Enums"]["board_key"]
          body: string
          created_at: string
          id: string
          income: number | null
          moderation_note: string | null
          region: string | null
          source_journal_id: string | null
          sponsored: boolean
          status: string
          tags: string[]
          thumb_url: string | null
          title: string
          topic: string | null
          views: number
        }
        Insert: {
          author_id: string
          board: Database["public"]["Enums"]["board_key"]
          body: string
          created_at?: string
          id?: string
          income?: number | null
          moderation_note?: string | null
          region?: string | null
          source_journal_id?: string | null
          sponsored?: boolean
          status?: string
          tags?: string[]
          thumb_url?: string | null
          title: string
          topic?: string | null
          views?: number
        }
        Update: {
          author_id?: string
          board?: Database["public"]["Enums"]["board_key"]
          body?: string
          created_at?: string
          id?: string
          income?: number | null
          moderation_note?: string | null
          region?: string | null
          source_journal_id?: string | null
          sponsored?: boolean
          status?: string
          tags?: string[]
          thumb_url?: string | null
          title?: string
          topic?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_channels: {
        Row: {
          followers: number | null
          id: string
          profile_id: string
          type: Database["public"]["Enums"]["channel_type"]
          url: string
        }
        Insert: {
          followers?: number | null
          id?: string
          profile_id: string
          type: Database["public"]["Enums"]["channel_type"]
          url: string
        }
        Update: {
          followers?: number | null
          id?: string
          profile_id?: string
          type?: Database["public"]["Enums"]["channel_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_channels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          badges: string[]
          brand: string | null
          created_at: string
          id: string
          intro: string | null
          level: number
          masked_contact: string | null
          name: string | null
          nickname: string
          points: number
          region: string | null
          role: Database["public"]["Enums"]["user_role"]
          tags: string[]
          trust_score: number
        }
        Insert: {
          account_status?: string
          badges?: string[]
          brand?: string | null
          created_at?: string
          id: string
          intro?: string | null
          level?: number
          masked_contact?: string | null
          name?: string | null
          nickname: string
          points?: number
          region?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tags?: string[]
          trust_score?: number
        }
        Update: {
          account_status?: string
          badges?: string[]
          brand?: string | null
          created_at?: string
          id?: string
          intro?: string | null
          level?: number
          masked_contact?: string | null
          name?: string | null
          nickname?: string
          points?: number
          region?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tags?: string[]
          trust_score?: number
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          platform: string
          profile_id: string
          token: string
        }
        Insert: {
          created_at?: string
          platform: string
          profile_id: string
          token: string
        }
        Update: {
          created_at?: string
          platform?: string
          profile_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          application_id: string
          check_result: Json | null
          content: string | null
          created_at: string
          feedback: string | null
          id: string
          photo_count: number
          rating: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["review_status"]
          submitted_at: string
          url: string | null
        }
        Insert: {
          application_id: string
          check_result?: Json | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          photo_count?: number
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          url?: string | null
        }
        Update: {
          application_id?: string
          check_result?: Json | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          photo_count?: number
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          bollinger_pos: string | null
          buy_date: string
          buy_price: number
          buy_reasons: string[]
          chk_bollinger: boolean
          chk_entry: boolean
          chk_ichimoku: boolean
          chk_ma: boolean
          chk_market: boolean
          chk_supply: boolean
          created_at: string
          emotion: string | null
          ichimoku_pos: string | null
          id: string
          ma_trend: Json
          market: Database["public"]["Enums"]["market"]
          memo: string | null
          name: string
          profile_id: string
          qty: number
          resistance: string | null
          sell_date: string | null
          sell_index: string | null
          sell_intraday: string | null
          sell_price: number | null
          sell_volume: string | null
          stop_price: number | null
          support: string | null
          target_price: number | null
        }
        Insert: {
          bollinger_pos?: string | null
          buy_date: string
          buy_price: number
          buy_reasons?: string[]
          chk_bollinger?: boolean
          chk_entry?: boolean
          chk_ichimoku?: boolean
          chk_ma?: boolean
          chk_market?: boolean
          chk_supply?: boolean
          created_at?: string
          emotion?: string | null
          ichimoku_pos?: string | null
          id?: string
          ma_trend?: Json
          market?: Database["public"]["Enums"]["market"]
          memo?: string | null
          name: string
          profile_id: string
          qty: number
          resistance?: string | null
          sell_date?: string | null
          sell_index?: string | null
          sell_intraday?: string | null
          sell_price?: number | null
          sell_volume?: string | null
          stop_price?: number | null
          support?: string | null
          target_price?: number | null
        }
        Update: {
          bollinger_pos?: string | null
          buy_date?: string
          buy_price?: number
          buy_reasons?: string[]
          chk_bollinger?: boolean
          chk_entry?: boolean
          chk_ichimoku?: boolean
          chk_ma?: boolean
          chk_market?: boolean
          chk_supply?: boolean
          created_at?: string
          emotion?: string | null
          ichimoku_pos?: string | null
          id?: string
          ma_trend?: Json
          market?: Database["public"]["Enums"]["market"]
          memo?: string | null
          name?: string
          profile_id?: string
          qty?: number
          resistance?: string | null
          sell_date?: string | null
          sell_index?: string | null
          sell_intraday?: string | null
          sell_price?: number | null
          sell_volume?: string | null
          stop_price?: number | null
          support?: string | null
          target_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_events: {
        Row: {
          created_at: string
          delta: number
          id: string
          kind: string
          note: string | null
          profile_id: string
          ref_id: string | null
          ref_type: string | null
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          kind: string
          note?: string | null
          profile_id: string
          ref_id?: string | null
          ref_type?: string | null
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          kind?: string
          note?: string | null
          profile_id?: string
          ref_id?: string | null
          ref_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          channel: string
          contact: string
          created_at: string
          id: string
          source: string | null
        }
        Insert: {
          channel: string
          contact: string
          created_at?: string
          id?: string
          source?: string | null
        }
        Update: {
          channel?: string
          contact?: string
          created_at?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      brand_rating_stats: {
        Args: never
        Returns: {
          advertiser_id: string
          average: number
          brand: string
          match_rate: number
          on_time_rate: number
          rating_count: number
        }[]
      }
      delete_my_account: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      application_status:
        | "pending"
        | "selected"
        | "rejected"
        | "submitted"
        | "completed"
        | "cancelled"
      board_key:
        | "income"
        | "sidejob"
        | "subsidy"
        | "stock"
        | "groupbuy"
        | "free"
        | "region"
        | "qna"
      campaign_status:
        | "draft"
        | "pending"
        | "open"
        | "closed"
        | "selected"
        | "ongoing"
        | "done"
        | "cancelled"
      channel_type:
        | "instagram"
        | "blog"
        | "youtube"
        | "tiktok"
        | "receipt"
        | "survey"
      info_category:
        | "subsidy"
        | "policy"
        | "saving"
        | "card"
        | "finance"
        | "parenting"
        | "pet"
        | "sidejob"
      market: "KOSPI" | "KOSDAQ" | "ETF" | "US"
      review_status: "pending" | "revision" | "approved" | "rejected"
      trend: "up" | "down"
      user_role: "member" | "advertiser" | "admin"
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
    Enums: {
      application_status: [
        "pending",
        "selected",
        "rejected",
        "submitted",
        "completed",
        "cancelled",
      ],
      board_key: [
        "income",
        "sidejob",
        "subsidy",
        "stock",
        "groupbuy",
        "free",
        "region",
        "qna",
      ],
      campaign_status: [
        "draft",
        "pending",
        "open",
        "closed",
        "selected",
        "ongoing",
        "done",
        "cancelled",
      ],
      channel_type: [
        "instagram",
        "blog",
        "youtube",
        "tiktok",
        "receipt",
        "survey",
      ],
      info_category: [
        "subsidy",
        "policy",
        "saving",
        "card",
        "finance",
        "parenting",
        "pet",
        "sidejob",
      ],
      market: ["KOSPI", "KOSDAQ", "ETF", "US"],
      review_status: ["pending", "revision", "approved", "rejected"],
      trend: ["up", "down"],
      user_role: ["member", "advertiser", "admin"],
    },
  },
} as const
