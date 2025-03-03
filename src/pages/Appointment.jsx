/*************  ✨ Codeium Command 🌟  *************/
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from './RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {


  const { docId } = useParams()
  const { doctors, currentSymbol, getDoctorsData, token, bakendUrl } = useContext(AppContext)
  const daysOfWeak = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const navigate = useNavigate()


  const fetchDocInfo = async () => {

    if (Array.isArray(doctors)) { // ✅ Ensure `doctors` is an array before using `.find()`
      const docInfo = doctors.find(doc => doc._id === docId);
      setDocInfo(docInfo);
    }

  }
  useEffect(() => {
    fetchDocInfo()
  }, [docId, doctors])
  // time state to manage
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(1)
  const [slotTime, setSlotTime] = useState('')
  const getAvailableSlots = async () => {
    setDocSlots([])
    // Gettting current Date
    let today = new Date()
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      console.log(currentDate)
      // setting end time of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)
      //setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }
      let timeSlot = []
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        // let day = currentDate.getDay()
        // let month = currentDate.getMonth() + 1
        // let year = currentDate.getFullYear()
        // const slotDate = day + "_" + month + "_" + year
        // const slotTime = formattedTime
        // const isSlotAVailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;
        //add slot to array
        timeSlot.push({
          datetime: new Date(currentDate),
          time: formattedTime
        })
        // increment current time by 30 minute
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev, timeSlot]))
    }
  }
  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }
    try {
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year

      console.log(slotDate)

      const { data } = await axios.post(bakendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { Authorization: `Bearer ${token}` } })

      console.log(data)

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appintments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  useEffect(() => {
    console.log(docSlots)
  }, [docSlots])


  return docInfo && (
    <div>
      {/* ------- Doctor Details ------ */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img src={docInfo.image} className="bg-primary w-full sm:max-w-72 rounded-lg " />
        </div>
        {/* flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 */}
        <div className='flex-1  border border-gray-500 rounded-xl bg-white p-8 py-7 mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* ====== Doc Info : name degree , experience ====== */}
          <p className='flex items-center gap-2 text-2xl font-medium'>{docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" /></p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* ===== doctor About ====== */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
              {docInfo.about}
            </p>
          </div>
          <p className='font-medium mt-3'>
            Appointment fee: <span> {currentSymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/* ====== Booking Slots ======== */}
      <div className='sm:ml-72 sm:pl-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className="w-full flex gap-3 items-center overflow-x-scroll flex-nowrap mt-4">

          {docSlots.length && docSlots.map((item, index) => (
            <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : "border border-gray-300 "}`}>
              <p>{item[0] && daysOfWeak[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>
        <div className='flex items-center gap-3 w-ful overflow-x-scroll mt-4 '>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (

            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer  ${item.time === slotTime ? "bg-primary text-white " : "text-gray-500 border border-gray-600"}`} key={index} >
              {item.time.toLowerCase()}
            </p>

          ))}
        </div>
        <button
          onClick={bookAppointment}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full mt-5'>Book an appointment</button>
      </div>

      {/* Listing Related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>

  )
}

export default Appointment




/******  48504a94-a55e-4d08-b4fe-cce8e12ceadd  *******/