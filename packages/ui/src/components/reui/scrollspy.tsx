"use client"

import type { ReactNode, RefObject } from "react"
import { useEffect, useRef } from "react"

type ScrollspyProps = {
  children: ReactNode
  targetRef?: RefObject<
    HTMLElement | HTMLDivElement | Document | null | undefined
  >
  onUpdate?: (id: string) => void
  offset?: number
  smooth?: boolean
  className?: string
  dataAttribute?: string
  history?: boolean
  throttleTime?: number
}

type VungCuon = { phanTu: HTMLElement; laTrang: boolean }

function vungCuon(
  targetRef: ScrollspyProps["targetRef"]
): VungCuon | null {
  const goc = targetRef?.current
  if (!goc || goc === document) {
    return { phanTu: document.documentElement, laTrang: true }
  }
  if (!(goc instanceof HTMLElement)) return null
  const viewport = goc.querySelector('[data-slot="scroll-area-viewport"]')
  return {
    phanTu: viewport instanceof HTMLElement ? viewport : goc,
    laTrang: false,
  }
}

function doCuon(vung: VungCuon): number {
  return vung.laTrang ? window.scrollY : vung.phanTu.scrollTop
}

function viTri(section: HTMLElement, vung: VungCuon): number {
  const dinh = vung.laTrang ? 0 : vung.phanTu.getBoundingClientRect().top
  return section.getBoundingClientRect().top - dinh + doCuon(vung)
}

export function Scrollspy({
  children,
  targetRef,
  onUpdate,
  className,
  offset = 0,
  smooth = true,
  dataAttribute = "scrollspy",
  history = true,
  throttleTime = 0,
}: ScrollspyProps) {
  const selfRef = useRef<HTMLDivElement | null>(null)
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  })

  useEffect(() => {
    const self = selfRef.current
    if (!self) return
    const anchors = Array.from(
      self.querySelectorAll<HTMLElement>(`[data-${dataAttribute}-anchor]`)
    )
    const idCua = (anchor: HTMLElement | undefined) =>
      anchor
        ?.getAttribute(`data-${dataAttribute}-anchor`)
        ?.replace("#", "") || null
    const lechCua = (anchor: HTMLElement) => {
      const rieng = anchor.getAttribute(`data-${dataAttribute}-offset`)
      return rieng ? Number.parseInt(rieng, 10) : offset
    }

    let truoc: string | null = null
    const datHienTai = (id: string | null, ep = false) => {
      if (!id) return
      for (const anchor of anchors) {
        if (idCua(anchor) === id) anchor.setAttribute("data-active", "true")
        else anchor.removeAttribute("data-active")
      }
      if (truoc !== id) onUpdateRef.current?.(id)
      if (history && (ep || truoc !== id)) {
        window.history.replaceState(window.history.state, "", `#${id}`)
      }
      truoc = id
    }

    const tinh = () => {
      const vung = vungCuon(targetRef)
      if (!vung || anchors.length === 0) return
      const cuon = doCuon(vung)
      let chon = 0
      let gan = Number.POSITIVE_INFINITY
      anchors.forEach((anchor, i) => {
        const id = idCua(anchor)
        const section = id ? document.getElementById(id) : null
        if (!section) return
        const dinh = viTri(section, vung) - lechCua(anchor)
        const lech = Math.abs(dinh - cuon)
        if (dinh <= cuon && lech < gan) {
          gan = lech
          chon = i
        }
      })
      const { scrollHeight, clientHeight } = vung.phanTu
      if (scrollHeight > clientHeight + 2 && cuon + clientHeight >= scrollHeight - 2) {
        chon = anchors.length - 1
      }
      datHienTai(idCua(anchors[chon]))
    }

    let lanCuoi = 0
    let hen: ReturnType<typeof setTimeout> | undefined
    const khiCuon = (event: Event) => {
      const vung = vungCuon(targetRef)
      if (!vung) return
      const cuaVung =
        vung.laTrang ||
        (event.target instanceof Node && vung.phanTu.contains(event.target))
      if (!cuaVung) return
      const cho = throttleTime - (Date.now() - lanCuoi)
      if (cho <= 0) {
        lanCuoi = Date.now()
        tinh()
        return
      }
      if (hen !== undefined) return
      hen = setTimeout(() => {
        hen = undefined
        lanCuoi = Date.now()
        tinh()
      }, cho)
    }

    const nhay = (anchor: HTMLElement) => (event?: Event) => {
      event?.preventDefault()
      const id = idCua(anchor)
      const section = id ? document.getElementById(id) : null
      const vung = vungCuon(targetRef)
      if (!section || !vung) return
      const dich = viTri(section, vung) - lechCua(anchor)
      const noi: HTMLElement | Window = vung.laTrang ? window : vung.phanTu
      noi.scrollTo({ top: dich, left: 0, behavior: smooth ? "smooth" : "auto" })
      datHienTai(id, true)
    }

    const nghe = anchors.map((anchor) => [anchor, nhay(anchor)] as const)
    for (const [anchor, xuLy] of nghe) anchor.addEventListener("click", xuLy)
    window.addEventListener("scroll", khiCuon, true)

    const dau = setTimeout(() => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""))
      const theoHash = hash ? nghe.find(([anchor]) => idCua(anchor) === hash) : undefined
      if (theoHash) theoHash[1]()
      else tinh()
    }, 100)

    return () => {
      window.removeEventListener("scroll", khiCuon, true)
      for (const [anchor, xuLy] of nghe) anchor.removeEventListener("click", xuLy)
      clearTimeout(dau)
      if (hen !== undefined) clearTimeout(hen)
    }
  }, [targetRef, dataAttribute, offset, smooth, history, throttleTime])

  return (
    <div data-slot="scrollspy" className={className} ref={selfRef}>
      {children}
    </div>
  )
}
