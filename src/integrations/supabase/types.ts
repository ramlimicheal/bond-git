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
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount_amount: number
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          number: string
          org_id: string
          paid_at: string | null
          pdf_url: string | null
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
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number: string
          org_id: string
          paid_at?: string | null
          pdf_url?: string | null
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
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          org_id?: string
          paid_at?: string | null
          pdf_url?: string | null
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
            foreignKeyName: "lawyer_engagements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          country: string
          created_at: string
          created_by: string | null
          default_notes: string | null
          default_terms: string | null
          email: string | null
          gstin: string | null
          id: string
          invoice_prefix: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          plan: string
          proposal_prefix: string | null
          quote_prefix: string | null
          signature_url: string | null
          state: string | null
          trial_ends_at: string
          updated_at: string
          upi_vpa: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_notes?: string | null
          default_terms?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          plan?: string
          proposal_prefix?: string | null
          quote_prefix?: string | null
          signature_url?: string | null
          state?: string | null
          trial_ends_at?: string
          updated_at?: string
          upi_vpa?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_notes?: string | null
          default_terms?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          plan?: string
          proposal_prefix?: string | null
          quote_prefix?: string | null
          signature_url?: string | null
          state?: string | null
          trial_ends_at?: string
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
          created_at: string
          created_by: string | null
          currency: string
          discount_amount: number
          id: string
          issue_date: string
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
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          id?: string
          issue_date?: string
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
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          id?: string
          issue_date?: string
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
      [_ in never]: never
    }
    Functions: {
      can_write_org: { Args: { _org_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { _org_id: string }; Returns: boolean }
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
      org_role: "owner" | "admin" | "accountant" | "viewer"
      proposal_status: "draft" | "sent" | "viewed" | "signed" | "declined"
      quote_status: "draft" | "sent" | "accepted" | "declined" | "expired"
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
      org_role: ["owner", "admin", "accountant", "viewer"],
      proposal_status: ["draft", "sent", "viewed", "signed", "declined"],
      quote_status: ["draft", "sent", "accepted", "declined", "expired"],
    },
  },
} as const
