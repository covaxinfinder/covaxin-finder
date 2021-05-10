import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import './App.css';
import { HospitalsTable } from './HospitalsTable';
const timeGap = 5;
const App = () => {
  const [indexes, setIndexes] = React.useState([0]);
  const [counter, setCounter] = React.useState(1);
  const { register, handleSubmit } = useForm();
  const [ formError, setError ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ allCenters, setAllCenters ] = useState([]);
  const [ availaleCenters, setAvailaleCenters ] = useState([]);
  const [ lastFetched, setLastFetched ] = useState([]);
  const [ timer, setTimer ] = useState(null);

  useEffect(() => {
    async function getPermission() {
      let perm = await Notification.requestPermission();
      if (perm === 'denied') {
        setError("Enable notification permission to notify when vaccine is available")
      }
    }
    getPermission();
    return () => {
      console.log("Cleaning out");
      if (timer) clearInterval(timer);
    };
  }, []);

  const fetchAllResult = ({pincode, email, age_limit}) => {
    console.log("AGE limit ", age_limit);
    setEmail(email);
    let getCurrentDate = () => {
      const pad = (s) => (s < 10) ? '0' + s : s;
      let d = new Date()
      return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-');
    }
    let date = getCurrentDate();
    let promises = pincode.map(code => fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${code.pincode}&date=${date}`))
    let lastFetched = new Date();
    let nextFetchTime = new Date(lastFetched.getTime() + timeGap * 60000);
    setLastFetched(
      [
        lastFetched.toLocaleDateString(),
        formatAMPM(lastFetched),
        nextFetchTime.toLocaleDateString(),
        formatAMPM(nextFetchTime)
      ]
    );
    Promise.all(promises)
      .then(results => Promise.all(results.map(result => result.json())))
      .then(areas => {
        let availableSlots = [];
        let allCenter = [];
        areas.forEach(area => {
          let centers = area.centers;
          allCenter.push(...centers);
          centers.forEach(center => {
            let centerCpy = {...center};
            centerCpy.sessions = [];
            delete centerCpy['center_id'];
            delete centerCpy['block_name'];
            delete centerCpy['lat'];
            delete centerCpy['long'];
            delete centerCpy['from'];
            delete centerCpy['to'];
            center.sessions.forEach(session => {
              if (session.available_capacity > 0) {
                let _session = {...session};
                delete _session['session_id'];
                delete _session['slots'];
                if (age_limit === 'on') {
                  centerCpy.sessions.push(_session);
                } else if (age_limit === '18' && session.min_age_limit === 18) {
                  centerCpy.sessions.push(_session);
                } else if (age_limit === '45' && session.min_age_limit === 45) {
                  centerCpy.sessions.push(_session);
                }
              }
            })
            if (centerCpy.sessions.length > 0) {
              availableSlots.push(centerCpy);
            }
          });
        }); //forEach ends

        setAllCenters(allCenter);
        setAvailaleCenters(availableSlots);
        if (availableSlots.length) {
          // Add logic to send email or do something else

          try {
            new Notification('Vaccine is available!',{
              body: 'Happy Vaccine! Book ASAP'
            });
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch(err => {
        console.log(err);
        setError(err);
      })
  };
  const onSubmit = data => {
    if (timer) clearInterval(timer);
    let error = false;
    if (!data.pincode) {
      setError('There is an error in the form');
      return false;
    }
    data.pincode.some(field => {
      if (!field.pincode) error = true;
      if (Number.isNaN(Number(field.pincode))) error = true;
      if (field.pincode.length !== 6) error = true;
      if (error) return true;
    });
    if (error) {
      setError('There is an error in the form');
      return false;
    }
    setError('');
    let isOk = window.confirm("Are you sure want to proceed?")
    if (!isOk) return false;
    fetchAllResult(data);
    setTimer(
      setInterval(() => {
        fetchAllResult(data);
      }, timeGap * 60 * 1000)
    );
  };

  const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
  };

  const addPincode = () => {
    if (counter >= 5) {
      setError("Maximum 5 pincodes are allowed");
      return
    } else {
      setError('');
    }
    setIndexes(prevIndexes => [...prevIndexes, counter]);
    setCounter(prevCounter => prevCounter + 1);
  };

  const removePincode = index => () => {
    setIndexes(prevIndexes => [...prevIndexes.filter(item => item !== index)]);
    setCounter(prevCounter => prevCounter - 1);
  };

  const clearFriends = () => {
    let isOk = window.confirm("Are you sure want clear all?")
    if (!isOk) return false;
    setIndexes([0]);
  };

  const stopTimer = () => {
    if (timer) clearInterval(timer);
    setTimer(null);
  }

  return (
    <div className="container">
      <h1 style={{marginBottom:0}}>You can book at :: <a href="https://selfregistration.cowin.gov.in/" target="_blank">https://selfregistration.cowin.gov.in</a></h1>
      <h3 style={{marginTop:'5px'}}>Data is fetched from <a href="https://apisetu.gov.in/public/marketplace/api/cowin/cowin-public-v2#/" target="_blank">Api Setu</a></h3>
      {
        !timer && (
        <>
          <h2>This site helps you to find vaccinations from the given pincode by auto sync every {timeGap} minutes.<br /> Mail notification will be sent.</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
            <div className="form-group mt-2">
              <div>
                <label className="mr-2">
                  <input
                    type="radio"
                    className="form-control"
                    name="age_limit"
                    ref={register}
                    defaultChecked={true}
                  />
                  <span>All ages</span>
                </label>
                <label className="mr-2">
                  <input
                    type="radio"
                    className="form-control"
                    name="age_limit"
                    ref={register}
                    value="18"
                  />
                  <span>Only 18+</span>
                </label>
                <label className="mr-2">
                  <input
                    type="radio"
                    className="form-control"
                    name="age_limit"
                    ref={register}
                    value="45"
                  />
                  <span>Only 45+</span>
                </label>
              </div>
              <label className="mr-2">
                Email to notify :
              </label>
              <input
                type="text"
                className="form-control"
                name={`email`}
                ref={register}
                placeholder="Enter your email address"
                required={true}
              />
            </div>
            <div className="form-area">
              {indexes.map(index => {
                const fieldName = `pincode[${index}]`;
                return (
                  <fieldset name={fieldName} key={fieldName}>
                    <div className="form-group mt-2">
                      <label className="mr-2">
                        Enter pincode {index + 1} :
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name={`${fieldName}.pincode`}
                        ref={register}
                        placeholder="Your area pin code"
                        required={true}
                      />
                      <button className="btn btn-danger" type="button" onClick={removePincode(index)}>
                        &times;
                      </button>
                    </div>
                  </fieldset>
                );
              })}
            </div>
            <button type="button" className="btn btn-danger mr-2" onClick={addPincode}>
              &#43; Add pincode
            </button>
            <button type="button" className="btn btn-danger mr-2" onClick={clearFriends}>
              &times; All
            </button>
            <button type="submit" className="btn btn-success">
              Start alerting me
            </button>
            </form>
          </>
          )
        }

        { formError && <h1 className="text-danger">{formError}</h1> }

        {
          timer && (
            <>
              <span>{ timer && <h2><i>Timer is running! Relax I will notify you on <a href="#" target="_blank">{email}</a>.<br />Just don't refresh or close this tab. <button onClick={stopTimer} className="btn btn-small btn-info">Click to stop sync</button></i></h2> }</span>
              {
                lastFetched.length && (
                  <>
                    <h3>Sync details</h3>
                    <table className="table table-responsive table-bordered">
                      <thead>
                        <tr>
                          <th>Last fetched date &amp; time</th>
                          <th>Next sync date &amp; time (5 mins)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{ lastFetched[0] } { lastFetched[1] }</td>
                          <td>{ lastFetched[2] } { lastFetched[3] }</td>
                        </tr>
                      </tbody>
                    </table>
                    <hr />
                  </>
                )
              }
              <div style={{ overflow: 'auto' }}>
                {
                  availaleCenters.length ? <HospitalsTable heading="Vaccin available centers" allCenters={availaleCenters} /> : <h3 className="alert alert-warning">Slots are unavailable. You will be notified once you get slots.</h3>
                }
              </div>
              <div style={{ overflow: 'auto' }}>
                {
                  allCenters.length ? <HospitalsTable heading="All centers" allCenters={allCenters} /> : <h3 className="alert alert-danger">No vaccination centers found in this area</h3>
                }
              </div>
            </>
            )
        }
    </div>
  );
}

export default App;
