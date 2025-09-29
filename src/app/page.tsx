import CalculatorApp from '@/components/Calculator/CalculatorApp'
import PageTitle from '@/components/Layout/PageTitle'
import PageDisclaimer from '@/components/Layout/PageDisclaimer'

export default function Home() {
  return (
    <main className="page">
      <PageTitle />
      <CalculatorApp />
      <PageDisclaimer />
    </main>
  )
}