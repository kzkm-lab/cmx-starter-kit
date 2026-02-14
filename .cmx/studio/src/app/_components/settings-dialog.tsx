"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnvSetupForm } from "./env-setup-form"
import { SiteSetupForm } from "./site-setup-form"
import { AlertCircle } from "lucide-react"

type EnvVars = {
  CMX_API_KEY?: string
  CMX_API_URL?: string
  NEXT_PUBLIC_SITE_URL?: string
}

type SiteConfig = {
  siteName?: string
  siteUrl?: string
  language?: string
  siteType?: string
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [envConfigured, setEnvConfigured] = useState<boolean | null>(null)
  const [envValues, setEnvValues] = useState<EnvVars>({})
  const [siteConfigured, setSiteConfigured] = useState<boolean | null>(null)
  const [siteValues, setSiteValues] = useState<SiteConfig>({})

  // 環境変数の状態を確認
  useEffect(() => {
    if (!open) return

    const checkEnv = async () => {
      try {
        const response = await fetch("/api/setup/env")
        const data = await response.json()

        const isConfigured = !!(
          data.env?.CMX_API_KEY && data.env.CMX_API_KEY !== "your_api_key_here"
        )
        setEnvConfigured(isConfigured)
        setEnvValues(data.env || {})
      } catch (error) {
        console.error("Failed to check env status:", error)
        setEnvConfigured(false)
      }
    }

    const checkSite = async () => {
      try {
        const response = await fetch("/api/setup/site")
        const data = await response.json()

        const isConfigured = !!(
          data.config?.siteName && data.config?.siteUrl
        )
        setSiteConfigured(isConfigured)
        setSiteValues(data.config || {})
      } catch (error) {
        console.error("Failed to check site config:", error)
        setSiteConfigured(false)
      }
    }

    checkEnv()
    checkSite()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 flex flex-col">
        <div className="px-8 pt-8 pb-6 border-b">
          <DialogHeader>
            <DialogTitle>設定</DialogTitle>
            <DialogDescription>
              セットアップに必要な設定を管理します
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <Tabs defaultValue="environment" className="w-full">
          <TabsList>
            <TabsTrigger value="environment" className="relative">
              環境変数
              {envConfigured === false && (
                <AlertCircle className="ml-2 h-4 w-4 text-yellow-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="site" className="relative">
              サイト設定
              {siteConfigured === false && (
                <AlertCircle className="ml-2 h-4 w-4 text-yellow-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="advanced" disabled>
              詳細設定
              <span className="ml-2 text-xs text-muted-foreground">
                (準備中)
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="environment" className="mt-6">
            {envConfigured === null ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    環境変数を確認中...
                  </p>
                </div>
              </div>
            ) : (
              <EnvSetupForm
                initialValues={envValues}
                onComplete={() => {
                  setEnvConfigured(true)
                  // 環境変数を再取得
                  fetch("/api/setup/env")
                    .then((res) => res.json())
                    .then((data) => setEnvValues(data.env || {}))
                  // ダイアログを閉じる
                  setTimeout(() => {
                    onOpenChange(false)
                  }, 1500)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="site" className="mt-6">
            {siteConfigured === null ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    サイト設定を確認中...
                  </p>
                </div>
              </div>
            ) : (
              <SiteSetupForm
                initialValues={siteValues}
                onComplete={() => {
                  setSiteConfigured(true)
                  // サイト設定を再取得
                  fetch("/api/setup/site")
                    .then((res) => res.json())
                    .then((data) => setSiteValues(data.config || {}))
                  // ダイアログを閉じる
                  setTimeout(() => {
                    onOpenChange(false)
                  }, 1500)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="advanced">
            <p className="text-muted-foreground">準備中です</p>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
