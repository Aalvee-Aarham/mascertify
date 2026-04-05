import MinimalTemplate from './templates/MinimalTemplate'
import AcademicTemplate from './templates/AcademicTemplate'
import ProfessionalTemplate from './templates/ProfessionalTemplate'
import ElegantTemplate from './templates/ElegantTemplate'

export default function CertificateTemplate({ cert, forPrint = false }) {
  const key = cert.templateKey || 'minimal'
  
  switch (key) {
    case 'academic': 
      return <AcademicTemplate cert={cert} forPrint={forPrint} />
    case 'professional':
      return <ProfessionalTemplate cert={cert} forPrint={forPrint} />
    case 'elegant':
      return <ElegantTemplate cert={cert} forPrint={forPrint} />
    default:
      return <MinimalTemplate cert={cert} forPrint={forPrint} />
  }
}
