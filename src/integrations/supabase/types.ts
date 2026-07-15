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
      activity_log_v2: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: unknown
          meta: Json | null
          org_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: unknown
          meta?: Json | null
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: unknown
          meta?: Json | null
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_v2_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          meta: Json | null
          org_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta?: Json | null
          org_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          at: string
          case_id: string
          id: string
          kind: string
          payload: Json | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          at?: string
          case_id: string
          id?: string
          kind: string
          payload?: Json | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          at?: string
          case_id?: string
          id?: string
          kind?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_access: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          invoice_id: string | null
          last_accessed_at: string | null
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invoice_id?: string | null
          last_accessed_at?: string | null
          token: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invoice_id?: string | null
          last_accessed_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_access_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          auth_user_id: string | null
          client_id: string
          created_at: string
          email: string
          id: string
          last_login_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          client_id: string
          created_at?: string
          email: string
          id?: string
          last_login_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          client_id?: string
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          pan: string | null
          phone: string | null
          pincode: string | null
          portal_user_id: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          portal_user_id?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          portal_user_id?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          org_id: string
          raised_by_client_user_id: string | null
          reason: string
          resolution: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          org_id: string
          raised_by_client_user_id?: string | null
          reason: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          org_id?: string
          raised_by_client_user_id?: string | null
          reason?: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_raised_by_client_user_id_fkey"
            columns: ["raised_by_client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          flag: string
          id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          flag: string
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          flag?: string
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      impersonation_sessions: {
        Row: {
          admin_id: string
          ended_at: string | null
          expires_at: string
          id: string
          reason: string | null
          started_at: string
          target_org_id: string
        }
        Insert: {
          admin_id: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          reason?: string | null
          started_at?: string
          target_org_id: string
        }
        Update: {
          admin_id?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          reason?: string | null
          started_at?: string
          target_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impersonation_sessions_target_org_id_fkey"
            columns: ["target_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          position: number
          product_id: string | null
          quantity: number
          rate: number
          tax_rate: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          position?: number
          product_id?: string | null
          quantity?: number
          rate?: number
          tax_rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          rate?: number
          tax_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          attached_lawyer_id: string | null
          client_id: string | null
          client_name: string | null
          client_type: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount_amount: number
          due_date: string | null
          id: string
          is_interstate: boolean
          issue_date: string
          items: Json
          notes: string | null
          number: string
          org_id: string
          paid_at: string | null
          pdf_url: string | null
          place_of_supply_state: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          terms: string | null
          total: number
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          amount_paid?: number
          attached_lawyer_id?: string | null
          client_id?: string | null
          client_name?: string | null
          client_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          is_interstate?: boolean
          issue_date?: string
          items?: Json
          notes?: string | null
          number: string
          org_id: string
          paid_at?: string | null
          pdf_url?: string | null
          place_of_supply_state?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          amount_paid?: number
          attached_lawyer_id?: string | null
          client_id?: string | null
          client_name?: string | null
          client_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          is_interstate?: boolean
          issue_date?: string
          items?: Json
          notes?: string | null
          number?: string
          org_id?: string
          paid_at?: string | null
          pdf_url?: string | null
          place_of_supply_state?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_attached_lawyer_id_fkey"
            columns: ["attached_lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_attached_lawyer_id_fkey"
            columns: ["attached_lawyer_id"]
            isOneToOne: false
            referencedRelation: "public_lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_engagements: {
        Row: {
          case_id: string
          created_at: string
          fee: number | null
          id: string
          lawyer_id: string
          org_id: string
          scope: string | null
          status: Database["public"]["Enums"]["engagement_status"]
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          fee?: number | null
          id?: string
          lawyer_id: string
          org_id: string
          scope?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          fee?: number | null
          id?: string
          lawyer_id?: string
          org_id?: string
          scope?: string | null
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_engagements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_engagements_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_engagements_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "public_lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_engagements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_kyc: {
        Row: {
          address_doc_url: string | null
          bar_council_doc_url: string | null
          id_doc_url: string | null
          lawyer_id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          address_doc_url?: string | null
          bar_council_doc_url?: string | null
          id_doc_url?: string | null
          lawyer_id: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          address_doc_url?: string | null
          bar_council_doc_url?: string | null
          id_doc_url?: string | null
          lawyer_id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_kyc_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: true
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_kyc_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: true
            referencedRelation: "public_lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_payouts: {
        Row: {
          created_at: string
          gross_inr: number
          id: string
          lawyer_id: string
          net_inr: number
          paid_at: string | null
          period_month: string
          platform_fee_inr: number
          razorpay_transfer_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          gross_inr?: number
          id?: string
          lawyer_id: string
          net_inr?: number
          paid_at?: string | null
          period_month: string
          platform_fee_inr?: number
          razorpay_transfer_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          gross_inr?: number
          id?: string
          lawyer_id?: string
          net_inr?: number
          paid_at?: string | null
          period_month?: string
          platform_fee_inr?: number
          razorpay_transfer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_payouts_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_payouts_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "public_lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          active: boolean
          bar_council_no: string
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          rate_per_hour: number | null
          specialties: string[]
          states: string[]
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          active?: boolean
          bar_council_no: string
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          rate_per_hour?: number | null
          specialties?: string[]
          states?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          active?: boolean
          bar_council_no?: string
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          rate_per_hour?: number | null
          specialties?: string[]
          states?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      legal_cases: {
        Row: {
          amount_claimed: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          interest_rate: number | null
          invoice_id: string | null
          notes: string | null
          opened_at: string
          org_id: string
          resolved_at: string | null
          stage: Database["public"]["Enums"]["case_stage"]
          updated_at: string
        }
        Insert: {
          amount_claimed?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interest_rate?: number | null
          invoice_id?: string | null
          notes?: string | null
          opened_at?: string
          org_id: string
          resolved_at?: string | null
          stage?: Database["public"]["Enums"]["case_stage"]
          updated_at?: string
        }
        Update: {
          amount_claimed?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interest_rate?: number | null
          invoice_id?: string | null
          notes?: string | null
          opened_at?: string
          org_id?: string
          resolved_at?: string | null
          stage?: Database["public"]["Enums"]["case_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          case_id: string
          content: string | null
          created_at: string
          created_by: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          id: string
          org_id: string
          pdf_url: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          case_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          doc_type: Database["public"]["Enums"]["legal_doc_type"]
          id?: string
          org_id: string
          pdf_url?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          case_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["legal_doc_type"]
          id?: string
          org_id?: string
          pdf_url?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_messages: {
        Row: {
          attachments: Json | null
          body: string
          case_id: string
          created_at: string
          id: string
          org_id: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          case_id: string
          created_at?: string
          id?: string
          org_id: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          org_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_notices: {
        Row: {
          acknowledged_at: string | null
          ai_draft: string
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          lawyer_id: string | null
          notes: string | null
          org_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["legal_notice_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          ai_draft?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          lawyer_id?: string | null
          notes?: string | null
          org_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["legal_notice_status"]
          subject?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          ai_draft?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          lawyer_id?: string | null
          notes?: string | null
          org_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["legal_notice_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_notices_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_notices_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_notices_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "public_lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_notices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          org_id: string
          plan_code: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          seats: number
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          org_id: string
          plan_code: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          org_id?: string
          plan_code?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_email: string | null
          joined_at: string | null
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_email?: string | null
          joined_at?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_email?: string | null
          joined_at?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          auto_notice_days: number
          auto_notice_enabled: boolean
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          brand_accent: string | null
          city: string | null
          country: string
          created_at: string
          created_by: string | null
          default_notes: string | null
          default_sac: string
          default_state_code: string | null
          default_tax_rate: number
          default_terms: string | null
          email: string | null
          gstin: string | null
          id: string
          invoice_prefix: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          notifications: Json
          onboarded: boolean
          pan: string | null
          phone: string | null
          pincode: string | null
          plan: string
          proposal_prefix: string | null
          quote_prefix: string | null
          seat_limit: number
          signature_url: string | null
          state: string | null
          trial_ends_at: string
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
          upi_vpa: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          auto_notice_days?: number
          auto_notice_enabled?: boolean
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          brand_accent?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_notes?: string | null
          default_sac?: string
          default_state_code?: string | null
          default_tax_rate?: number
          default_terms?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          notifications?: Json
          onboarded?: boolean
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          plan?: string
          proposal_prefix?: string | null
          quote_prefix?: string | null
          seat_limit?: number
          signature_url?: string | null
          state?: string | null
          trial_ends_at?: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          upi_vpa?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          auto_notice_days?: number
          auto_notice_enabled?: boolean
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          brand_accent?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_notes?: string | null
          default_sac?: string
          default_state_code?: string | null
          default_tax_rate?: number
          default_terms?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          notifications?: Json
          onboarded?: boolean
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          plan?: string
          proposal_prefix?: string | null
          quote_prefix?: string | null
          seat_limit?: number
          signature_url?: string | null
          state?: string | null
          trial_ends_at?: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          upi_vpa?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string
          method: string | null
          notes: string | null
          org_id: string
          paid_at: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          reference: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id: string
          method?: string | null
          notes?: string | null
          org_id: string
          paid_at?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          method?: string | null
          notes?: string | null
          org_id?: string
          paid_at?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          code: string
          created_at: string
          features: Json
          limits: Json
          name: string
          price_inr_monthly: number
          price_inr_yearly: number
          seat_price_inr: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          features?: Json
          limits?: Json
          name: string
          price_inr_monthly?: number
          price_inr_yearly?: number
          seat_price_inr?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          features?: Json
          limits?: Json
          name?: string
          price_inr_monthly?: number
          price_inr_yearly?: number
          seat_price_inr?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          created_by: string | null
          role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          role?: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          role?: Database["public"]["Enums"]["platform_admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      portal_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          org_id: string
          revoked_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          org_id: string
          revoked_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          org_id?: string
          revoked_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          hsn_code: string | null
          id: string
          name: string
          org_id: string
          price: number
          sku: string | null
          tax_rate: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hsn_code?: string | null
          id?: string
          name: string
          org_id: string
          price?: number
          sku?: string | null
          tax_rate?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hsn_code?: string | null
          id?: string
          name?: string
          org_id?: string
          price?: number
          sku?: string | null
          tax_rate?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_signature: string | null
          client_signed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          issue_date: string
          number: string
          org_id: string
          pdf_url: string | null
          project_type: string | null
          sections: Json
          sender_signature: string | null
          sender_signed_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          total_value: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_signature?: string | null
          client_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string
          number: string
          org_id: string
          pdf_url?: string | null
          project_type?: string | null
          sections?: Json
          sender_signature?: string | null
          sender_signed_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_signature?: string | null
          client_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string
          number?: string
          org_id?: string
          pdf_url?: string | null
          project_type?: string | null
          sections?: Json
          sender_signature?: string | null
          sender_signed_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          position: number
          product_id: string | null
          quantity: number
          quote_id: string
          rate: number
          tax_rate: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          quote_id: string
          rate?: number
          tax_rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          quote_id?: string
          rate?: number
          tax_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_type: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount_amount: number
          id: string
          issue_date: string
          items: Json
          notes: string | null
          number: string
          org_id: string
          pdf_url: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_amount: number
          terms: string | null
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          client_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          number: string
          org_id: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          client_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          number?: string
          org_id?: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string
          created_by: string | null
          frequency: string
          id: string
          last_run_at: string | null
          next_run_at: string
          org_id: string
          template: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          frequency: string
          id?: string
          last_run_at?: string | null
          next_run_at: string
          org_id: string
          template: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          frequency?: string
          id?: string
          last_run_at?: string | null
          next_run_at?: string
          org_id?: string
          template?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_meters: {
        Row: {
          count: number
          id: string
          meter: string
          org_id: string
          period_month: string
          updated_at: string
        }
        Insert: {
          count?: number
          id?: string
          meter: string
          org_id: string
          period_month: string
          updated_at?: string
        }
        Update: {
          count?: number
          id?: string
          meter?: string
          org_id?: string
          period_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_meters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_lawyers: {
        Row: {
          active: boolean | null
          bar_council_no: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          rate_per_hour: number | null
          specialties: string[] | null
          states: string[] | null
          verified: boolean | null
        }
        Insert: {
          active?: boolean | null
          bar_council_no?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          rate_per_hour?: number | null
          specialties?: string[] | null
          states?: string[] | null
          verified?: boolean | null
        }
        Update: {
          active?: boolean | null
          bar_council_no?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          rate_per_hour?: number | null
          specialties?: string[] | null
          states?: string[] | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_list_orgs: {
        Args: never
        Returns: {
          created_at: string
          current_period_end: string
          invoice_count: number
          member_count: number
          monthly_price_inr: number
          org_id: string
          org_name: string
          plan_code: string
          plan_name: string
          proposal_count: number
          quote_count: number
          subscription_status: string
        }[]
      }
      admin_mrr_summary: { Args: never; Returns: Json }
      bootstrap_first_platform_admin: { Args: never; Returns: boolean }
      can_write_org: { Args: { _org_id: string }; Returns: boolean }
      check_entitlement: {
        Args: { _feature: string; _org_id: string }
        Returns: Json
      }
      create_portal_token: {
        Args: {
          _entity_id: string
          _entity_type: string
          _org_id: string
          _ttl_days?: number
        }
        Returns: string
      }
      get_portal_context: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_usage_meter: {
        Args: { _delta?: number; _meter: string; _org_id: string }
        Returns: number
      }
      is_lawyer_of: { Args: { _lawyer_id: string }; Returns: boolean }
      is_org_admin: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { _org_id: string }; Returns: boolean }
      is_platform_admin: { Args: { _user_id?: string }; Returns: boolean }
      lawyer_is_attached_to_org_invoice: {
        Args: { _lawyer_id: string }
        Returns: boolean
      }
      list_marketplace_lawyers: {
        Args: never
        Returns: {
          active: boolean
          bar_council_no: string
          bio: string
          created_at: string
          full_name: string
          id: string
          rate_per_hour: number
          specialties: string[]
          states: string[]
          verified: boolean
        }[]
      }
      log_audit_event: {
        Args: {
          _action: string
          _entity_id?: string
          _entity_type?: string
          _meta?: Json
          _org_id: string
        }
        Returns: string
      }
      org_role_of: {
        Args: { _org_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
    }
    Enums: {
      app_role: "super_admin" | "lawyer" | "client_portal_user"
      case_stage:
        | "opened"
        | "notice_sent"
        | "reply_awaited"
        | "escalated"
        | "filed"
        | "resolved"
        | "withdrawn"
      engagement_status:
        | "proposed"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
      legal_doc_type:
        | "demand_letter"
        | "sec138_notice"
        | "sec8_ibc_demand"
        | "msme_samadhaan"
        | "client_reply"
        | "other"
      legal_notice_status: "draft" | "sent" | "acknowledged" | "closed"
      org_role: "owner" | "admin" | "accountant" | "viewer"
      org_type: "freelancer" | "agency"
      platform_admin_role: "super_admin" | "support" | "lawyer_ops"
      proposal_status: "draft" | "sent" | "viewed" | "signed" | "declined"
      quote_status: "draft" | "sent" | "accepted" | "declined" | "expired"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["super_admin", "lawyer", "client_portal_user"],
      case_stage: [
        "opened",
        "notice_sent",
        "reply_awaited",
        "escalated",
        "filed",
        "resolved",
        "withdrawn",
      ],
      engagement_status: [
        "proposed",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "partial",
        "paid",
        "overdue",
        "cancelled",
      ],
      legal_doc_type: [
        "demand_letter",
        "sec138_notice",
        "sec8_ibc_demand",
        "msme_samadhaan",
        "client_reply",
        "other",
      ],
      legal_notice_status: ["draft", "sent", "acknowledged", "closed"],
      org_role: ["owner", "admin", "accountant", "viewer"],
      org_type: ["freelancer", "agency"],
      platform_admin_role: ["super_admin", "support", "lawyer_ops"],
      proposal_status: ["draft", "sent", "viewed", "signed", "declined"],
      quote_status: ["draft", "sent", "accepted", "declined", "expired"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "paused",
      ],
    },
  },
} as const
