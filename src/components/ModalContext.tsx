"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import ConfirmModal from "./ConfirmModal"
import AlertModal from "./AlertModal"

type AlertType = "danger" | "success" | "info"
type ConfirmType = "danger" | "warning" | "info"

interface ModalContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => Promise<void>
  showConfirm: (message: string, type?: ConfirmType, title?: string) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  // Alert State
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    type: "info" as AlertType,
    title: undefined as string | undefined,
    resolve: null as ((value: void) => void) | null
  })

  // Confirm State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: "",
    type: "info" as ConfirmType,
    title: undefined as string | undefined,
    resolve: null as ((value: boolean) => void) | null
  })

  const showAlert = (message: string, type: AlertType = "info", title?: string) => {
    return new Promise<void>((resolve) => {
      setAlertState({ isOpen: true, message, type, title, resolve })
    })
  }

  const showConfirm = (message: string, type: ConfirmType = "warning", title?: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ isOpen: true, message, type, title, resolve })
    })
  }

  const handleAlertClose = () => {
    if (alertState.resolve) alertState.resolve()
    setAlertState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }

  const handleConfirmAction = (result: boolean) => {
    if (confirmState.resolve) confirmState.resolve(result)
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal 
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        title={alertState.title}
        onClose={handleAlertClose}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        type={confirmState.type}
        title={confirmState.title}
        onConfirm={() => handleConfirmAction(true)}
        onCancel={() => handleConfirmAction(false)}
      />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
