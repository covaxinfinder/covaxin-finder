import React from 'react';

export const HospitalsTable = ({allCenters, heading}) => {
  return (
    <>
      <hr />
      <h1>{heading}</h1>
      <table className="table table-striped table-responsive table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Slots</th>
          </tr>
        </thead>
        <tbody>
          {
            allCenters.map((center, index) => {
              return (
                <tr key={center.center_id + index}>
                  <td>{center.name} <span className={`label label-${ center.fee_type === 'Paid' ? 'danger' : 'success'}`}>{center.fee_type}</span></td>
                  <td>{center.address} - {center.pincode}</td>
                  <td style={{ padding: '0' }} width="45%">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Capacity</th>
                          <th>Age</th>
                          <th>Vaccine</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          center.sessions.map((session, idx) => {
                            return (
                              <tr key={session.session_id + idx}>
                                <td style={{'border': `1px solid ${session.available_capacity > 0 ? 'red' : '#ccc'}`}}>{session.available_capacity}</td>
                                <td>{session.min_age_limit}+</td>
                                <td>{session.vaccine}</td>
                                <td>{session.date}</td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </td>
                </tr>
              )
            })
          }
          
        </tbody>
      </table>
    </>
  );
}